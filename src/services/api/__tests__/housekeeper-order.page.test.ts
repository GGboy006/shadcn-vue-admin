import { describe, expect, it } from 'vitest'

import { normalizeHousekeeperOrderPage } from '@/services/api/housekeeper-order.page'

describe('normalizeHousekeeperOrderPage', () => {
  it('coerces string page fields from the live order page payload', () => {
    const page = normalizeHousekeeperOrderPage({
      pageNum: '1',
      pageSize: '10',
      total: '5',
      pages: '1',
      emptyFlag: false,
      list: [{
        orderId: '2096192226822606849',
        orderNo: 'ORD20260905190226f00447',
        orderStatus: 0,
      }],
    })

    expect(page.pageNum).toBe(1)
    expect(page.pageSize).toBe(10)
    expect(page.total).toBe(5)
    expect(page.pages).toBe(1)
    expect(page.list).toHaveLength(1)
  })

  it('treats missing list as empty', () => {
    const page = normalizeHousekeeperOrderPage(null)
    expect(page.list).toEqual([])
    expect(page.total).toBe(0)
    expect(page.emptyFlag).toBe(true)
  })
})
