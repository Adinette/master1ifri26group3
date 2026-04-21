import { Pool } from 'pg'

type InvoiceRow = {
  id: number
  order_id: number
  client_name: string
  amount: number
  status: string
  due_date: Date
  paid_at: Date | null
  created_at: Date
  updated_at: Date
}

type PaymentRow = {
  id: number
  invoice_id: number
  amount: number
  method: string
  created_at: Date
}

type CreateInvoiceInput = {
  orderId: number
  clientName: string
  amount: number
  dueDate: Date
}

type CreatePaymentInput = {
  invoiceId: number
  amount: number
  method: string
}

const globalForBillingStore = global as unknown as { billingPool?: Pool }

function getPool() {
  if (!globalForBillingStore.billingPool) {
    globalForBillingStore.billingPool = new Pool({ connectionString: process.env.DATABASE_URL })
  }

  return globalForBillingStore.billingPool
}

function mapPayment(row: PaymentRow) {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    amount: row.amount,
    method: row.method,
    createdAt: row.created_at,
  }
}

function mapInvoice(row: InvoiceRow, payments: ReturnType<typeof mapPayment>[] = []) {
  return {
    id: row.id,
    orderId: row.order_id,
    clientName: row.client_name,
    amount: row.amount,
    status: row.status,
    dueDate: row.due_date,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    payments,
  }
}

export async function listInvoices() {
  const pool = getPool()
  const { rows: invoiceRows } = await pool.query<InvoiceRow>(
    'select id, order_id, client_name, amount, status, due_date, paid_at, created_at, updated_at from invoices order by created_at desc'
  )

  const invoiceIds = invoiceRows.map((row) => row.id)
  const paymentsByInvoiceId = new Map<number, ReturnType<typeof mapPayment>[]>()

  if (invoiceIds.length > 0) {
    const { rows: paymentRows } = await pool.query<PaymentRow>(
      'select id, invoice_id, amount, method, created_at from payments where invoice_id = any($1::int[]) order by created_at desc',
      [invoiceIds]
    )

    for (const paymentRow of paymentRows) {
      const payment = mapPayment(paymentRow)
      const bucket = paymentsByInvoiceId.get(payment.invoiceId) ?? []
      bucket.push(payment)
      paymentsByInvoiceId.set(payment.invoiceId, bucket)
    }
  }

  return invoiceRows.map((row) => mapInvoice(row, paymentsByInvoiceId.get(row.id) ?? []))
}

export async function createInvoice(input: CreateInvoiceInput) {
  const { rows } = await getPool().query<InvoiceRow>(
    'insert into invoices (order_id, client_name, amount, status, due_date, created_at, updated_at) values ($1, $2, $3, $4, $5, now(), now()) returning id, order_id, client_name, amount, status, due_date, paid_at, created_at, updated_at',
    [input.orderId, input.clientName, input.amount, 'pending', input.dueDate]
  )

  return mapInvoice(rows[0])
}

export async function listPayments() {
  const { rows } = await getPool().query<PaymentRow>(
    'select id, invoice_id, amount, method, created_at from payments order by created_at desc'
  )

  return rows.map(mapPayment)
}

export async function createPaymentAndMarkInvoicePaid(input: CreatePaymentInput) {
  const pool = getPool()
  const client = await pool.connect()

  try {
    await client.query('begin')

    const { rows: paymentRows } = await client.query<PaymentRow>(
      'insert into payments (invoice_id, amount, method) values ($1, $2, $3) returning id, invoice_id, amount, method, created_at',
      [input.invoiceId, input.amount, input.method]
    )

    const { rows: invoiceRows } = await client.query<InvoiceRow>(
      "update invoices set status = 'paid', paid_at = now(), updated_at = now() where id = $1 returning id, order_id, client_name, amount, status, due_date, paid_at, created_at, updated_at",
      [input.invoiceId]
    )

    if (!invoiceRows[0]) {
      throw new Error('Facture non trouvée')
    }

    await client.query('commit')

    return {
      payment: mapPayment(paymentRows[0]),
      invoice: mapInvoice(invoiceRows[0]),
    }
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}