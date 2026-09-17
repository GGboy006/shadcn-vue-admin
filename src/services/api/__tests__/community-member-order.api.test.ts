import { describe, expect, it } from 'vitest'

import type { CommunityMemberPayWay } from '../community-member-order.model'

import {
  canCancelMemberOrder,
  memberOrderPayStatusText,
  memberOrderPayWayText,
  memberOrderStatusText,
  normalizeMemberOrder,
} from '../community-member-order.model'

describe('community-member-order helpers', () => {
  it('stringifies snowflake ids', () => {
    const order = normalizeMemberOrder({
      orderId: 12 as unknown as string,
      userId: 34 as unknown as string,
      packageId: 56 as unknown as string,
    })
    expect(order.orderId).toBe('12')
    expect(order.userId).toBe('34')
    expect(order.packageId).toBe('56')
  })

  it('maps payStatus 0-3', () => {
    expect(memberOrderPayStatusText(0)).toBe('待支付')
    expect(memberOrderPayStatusText(1)).toBe('已支付')
    expect(memberOrderPayStatusText(2)).toBe('已取消')
    expect(memberOrderPayStatusText(3)).toBe('已退款')
    expect(memberOrderPayStatusText()).toBe('-')
  })

  it('maps order status 1/2/3', () => {
    expect(memberOrderStatusText(1)).toBe('进行中')
    expect(memberOrderStatusText(2)).toBe('已完成')
    expect(memberOrderStatusText(3)).toBe('已取消')
  })

  it('maps pay way including free(0)', () => {
    expect(memberOrderPayWayText(0)).toBe('免费')
    expect(memberOrderPayWayText(1)).toBe('微信')
    expect(memberOrderPayWayText(2)).toBe('支付宝')
    expect(memberOrderPayWayText(3)).toBe('iOS 内购')
    expect(memberOrderPayWayText(9 as CommunityMemberPayWay)).toBeUndefined()
    expect(memberOrderPayWayText()).toBeUndefined()
  })

  it('allows cancel only when unpaid', () => {
    expect(canCancelMemberOrder({ payStatus: 0 })).toBe(true)
    expect(canCancelMemberOrder({ payStatus: 1 })).toBe(false)
    expect(canCancelMemberOrder({ payStatus: 2 })).toBe(false)
    expect(canCancelMemberOrder({ payStatus: 3 })).toBe(false)
  })
})
