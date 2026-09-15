import { describe, expect, it } from 'vitest'

import type { HousekeeperOrderActionFields } from '@/services/api/housekeeper-order.rules'

import {
  canCancelHousekeeperOrder,
  canReassignHousekeeperOrder,
  isLocalFulfill,
  isPaidWithAmount,
} from '@/services/api/housekeeper-order.rules'

function order(overrides: Partial<HousekeeperOrderActionFields> = {}): HousekeeperOrderActionFields {
  return {
    fulfillProviderCode: 'LOCAL',
    orderStatus: 0,
    payStatus: 0,
    payAmount: 0,
    totalAmount: 80,
    ...overrides,
  }
}

describe('housekeeper order action rules', () => {
  describe('isLocalFulfill', () => {
    it('treats empty and LOCAL as local', () => {
      expect(isLocalFulfill(undefined)).toBe(true)
      expect(isLocalFulfill(null)).toBe(true)
      expect(isLocalFulfill('')).toBe(true)
      expect(isLocalFulfill('LOCAL')).toBe(true)
    })

    it('treats third-party codes as remote', () => {
      expect(isLocalFulfill('ZMN')).toBe(false)
    })
  })

  describe('isPaidWithAmount', () => {
    it('is false when not paid', () => {
      expect(isPaidWithAmount(order({ payStatus: 0, payAmount: 80, totalAmount: 80 }))).toBe(false)
      expect(isPaidWithAmount(order({ payStatus: 1, payAmount: 80 }))).toBe(false)
    })

    it('is true when paid and either amount > 0', () => {
      expect(isPaidWithAmount(order({ payStatus: 2, payAmount: 80, totalAmount: 0 }))).toBe(true)
      expect(isPaidWithAmount(order({ payStatus: 2, payAmount: 0, totalAmount: 80 }))).toBe(true)
    })

    it('is false for zero-amount paid orders', () => {
      expect(isPaidWithAmount(order({ payStatus: 2, payAmount: 0, totalAmount: 0 }))).toBe(false)
    })
  })

  describe('canCancelHousekeeperOrder', () => {
    it('allows unpaid local orders in status 0-3', () => {
      for (const orderStatus of [0, 1, 2, 3] as const) {
        expect(canCancelHousekeeperOrder(order({ orderStatus, payStatus: 0 }))).toBe(true)
      }
    })

    it('allows zero-amount paid local orders', () => {
      expect(canCancelHousekeeperOrder(order({ orderStatus: 1, payStatus: 2, payAmount: 0, totalAmount: 0 }))).toBe(true)
    })

    it('hides cancel for paid orders with amount', () => {
      expect(canCancelHousekeeperOrder(order({ orderStatus: 1, payStatus: 2, payAmount: 80 }))).toBe(false)
    })

    it('hides cancel for finished / cancelled / rejected', () => {
      expect(canCancelHousekeeperOrder(order({ orderStatus: 4, payStatus: 0 }))).toBe(false)
      expect(canCancelHousekeeperOrder(order({ orderStatus: 5, payStatus: 0 }))).toBe(false)
      expect(canCancelHousekeeperOrder(order({ orderStatus: 6, payStatus: 0 }))).toBe(false)
    })

    it('hides cancel for third-party orders', () => {
      expect(canCancelHousekeeperOrder(order({ fulfillProviderCode: 'ZMN', payStatus: 0 }))).toBe(false)
    })
  })

  describe('canReassignHousekeeperOrder', () => {
    it('allows local pending or accepted orders', () => {
      expect(canReassignHousekeeperOrder(order({ orderStatus: 0 }))).toBe(true)
      expect(canReassignHousekeeperOrder(order({ orderStatus: 1 }))).toBe(true)
    })

    it('hides reassign after service starts', () => {
      expect(canReassignHousekeeperOrder(order({ orderStatus: 2 }))).toBe(false)
      expect(canReassignHousekeeperOrder(order({ orderStatus: 3 }))).toBe(false)
      expect(canReassignHousekeeperOrder(order({ orderStatus: 4 }))).toBe(false)
    })

    it('hides reassign for third-party orders', () => {
      expect(canReassignHousekeeperOrder(order({ fulfillProviderCode: 'ZMN', orderStatus: 0 }))).toBe(false)
    })

    it('allows reassign when fulfillProviderCode is empty', () => {
      expect(canReassignHousekeeperOrder(order({ fulfillProviderCode: '', orderStatus: 0 }))).toBe(true)
    })
  })
})
