import { Pool } from 'pg'

type NotificationRow = {
  id: number
  type: string
  message: string
  recipient: string
  status: string
  created_at: string
}

type NotificationInput = {
  type: string
  message: string
  recipient: string
  status: string
}

const globalForNotificationStore = global as unknown as { notificationPool?: Pool }

function getPool() {
  if (!globalForNotificationStore.notificationPool) {
    globalForNotificationStore.notificationPool = new Pool({ connectionString: process.env.DATABASE_URL })
  }

  return globalForNotificationStore.notificationPool
}

function mapNotification(row: NotificationRow) {
  return {
    id: row.id,
    type: row.type,
    message: row.message,
    recipient: row.recipient,
    status: row.status,
    createdAt: row.created_at,
  }
}

export async function listNotifications() {
  const { rows } = await getPool().query<NotificationRow>(
    'select id, type, message, recipient, status, created_at from notifications order by created_at desc'
  )

  return rows.map(mapNotification)
}

export async function createNotification(input: NotificationInput) {
  const { rows } = await getPool().query<NotificationRow>(
    'insert into notifications (type, message, recipient, status) values ($1, $2, $3, $4) returning id, type, message, recipient, status, created_at',
    [input.type, input.message, input.recipient, input.status]
  )

  return mapNotification(rows[0])
}