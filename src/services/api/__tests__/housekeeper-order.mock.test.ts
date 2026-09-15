import { beforeEach, describe, expect, it } from 'vitest'

import {
  mockCancelHousekeeperOrder,
  mockHousekeeperOrderDetail,
  mockHousekeeperOrderPage,
  mockReassignHousekeeperOrder,
  resetMockHousekeeperOrders,
} from '@/services/api/housekeeper-order.mock'

describe('housekeeper order mock (live account snapshot)', () => {
  beforeEach(() => {
    resetMockHousekeeperOrders()
  })

  it('returns the 5 real orders by default', async () => {
    const res = await mockHousekeeperOrderPage({ pageNum: 1, pageSize: 10 })
    expect(res.data.total).toBe(5)
    expect(res.data.list.map(item => item.orderNo)).toEqual([
      'ORD20260905190226f00447',
      'ORD20260902155429ee6918',
      'ORD2026090117181280a405',
      'ORD20260901160518869757',
      'ORD202608241508416b0e56',
    ])
  })

  it('filters unpaid pending orders', async () => {
    const res = await mockHousekeeperOrderPage({ pageNum: 1, pageSize: 10, orderStatus: 0, payStatus: 0 })
    expect(res.data.total).toBe(2)
    expect(res.data.list.every(item => item.orderStatus === 0 && item.payStatus === 0)).toBe(true)
  })

  it('cancels an unpaid pending order', async () => {
    await mockCancelHousekeeperOrder('2096192226822606849', { cancelReason: '演示取消' })
    const detail = await mockHousekeeperOrderDetail('2096192226822606849')
    expect(detail.data.orderStatus).toBe(5)
    expect(detail.data.cancelReason).toBe('演示取消')
  })

  it('reassigns 郑阿姨 to 刘阿姨', async () => {
    await mockReassignHousekeeperOrder('2096192226822606849', { staffId: '2090373993134673999' })
    const detail = await mockHousekeeperOrderDetail('2096192226822606849')
    expect(detail.data.staffName).toBe('刘阿姨')
    expect(detail.data.orderStatus).toBe(0)
    expect(detail.data.assignMode).toBe(1)
  })
})
