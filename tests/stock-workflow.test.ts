import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildStockAlertPayload,
  chooseReservationCandidate,
} from '../services/inventory/lib/stock-workflow'

test('chooseReservationCandidate selects the most stocked warehouse', () => {
  const candidate = chooseReservationCandidate(
    [
      {
        id: 1,
        productId: 7,
        productName: 'Tablette',
        warehouseId: 2,
        warehouse: 'Porto-Novo',
        quantity: 18,
        minThreshold: 5,
        updatedAt: new Date(),
      },
      {
        id: 2,
        productId: 7,
        productName: 'Tablette',
        warehouseId: 1,
        warehouse: 'Cotonou',
        quantity: 25,
        minThreshold: 5,
        updatedAt: new Date(),
      },
    ],
    10,
  )

  assert.ok(candidate)
  assert.equal(candidate?.warehouseId, 1)
})

test('chooseReservationCandidate breaks ties with the lowest warehouse id', () => {
  const candidate = chooseReservationCandidate(
    [
      {
        id: 1,
        productId: 12,
        productName: 'Bureau',
        warehouseId: 3,
        warehouse: 'Parakou',
        quantity: 14,
        minThreshold: 4,
        updatedAt: new Date(),
      },
      {
        id: 2,
        productId: 12,
        productName: 'Bureau',
        warehouseId: 1,
        warehouse: 'Cotonou',
        quantity: 14,
        minThreshold: 4,
        updatedAt: new Date(),
      },
    ],
    12,
  )

  assert.ok(candidate)
  assert.equal(candidate?.warehouseId, 1)
})

test('buildStockAlertPayload computes shortage-driven production quantity', () => {
  const payload = buildStockAlertPayload({
    trigger: 'insufficient-stock',
    productId: 99,
    productName: 'Chaise',
    currentQuantity: 3,
    availableQuantity: 3,
    requestedQuantity: 11,
    minThreshold: 4,
  })

  assert.equal(payload.shortage, 8)
  assert.equal(payload.recommendedProductionQuantity, 8)
})

test('buildStockAlertPayload preserves a minimum replenishment batch on low threshold', () => {
  const payload = buildStockAlertPayload({
    trigger: 'low-threshold',
    productId: 55,
    productName: 'Armoire',
    currentQuantity: 2,
    minThreshold: 6,
    warehouseId: 1,
    warehouse: 'Cotonou',
  })

  assert.equal(payload.shortage, undefined)
  assert.equal(payload.recommendedProductionQuantity, 12)
})