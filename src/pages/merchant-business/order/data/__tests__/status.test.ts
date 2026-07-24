import { describe, expect, it } from 'vitest'

import {
  orderStatusConfig,
  orderStatusTabs,
} from '@/pages/merchant-business/order/data/status'

describe('order status', () => {
  describe('orderStatusConfig', () => {
    it('should map 2 to completed', () => {
      expect(orderStatusConfig[2]).toEqual({
        value: 2,
        label: '已完成',
        style: expect.any(String),
      })
    })

    it('should map 3 to pending payment', () => {
      expect(orderStatusConfig[3].label).toBe('待付款')
    })

    it('should map 4 to refunded', () => {
      expect(orderStatusConfig[4].label).toBe('已退款')
    })
  })

  describe('orderStatusTabs', () => {
    it('should include an "all" tab with undefined value', () => {
      const allTab = orderStatusTabs.find(t => t.value === undefined)

      expect(allTab).toBeDefined()
      expect(allTab?.label).toBe('全部')
    })

    it('should include tabs for all three status types', () => {
      const statusValues = orderStatusTabs
        .filter(t => t.value !== undefined)
        .map(t => t.value)

      expect(statusValues).toEqual([2, 3, 4])
    })

    it('should have 4 tabs total (all + 3 statuses)', () => {
      expect(orderStatusTabs).toHaveLength(4)
    })

    it('should each tab have a label', () => {
      orderStatusTabs.forEach((tab) => {
        expect(tab.label).toBeTruthy()
      })
    })
  })
})
