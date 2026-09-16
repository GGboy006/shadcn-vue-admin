import { describe, expect, it } from 'vitest'

import type { CommunityMemberPayWay } from '../community-member-order.model'

import {
  memberOrderPayPlatformText,
  memberOrderPayStatusText,
  memberOrderPayWayText,
  memberOrderStatusText,
  normalizeMemberOrder,
} from '../community-member-order.model'

describe('community-member-order helpers', () => {
  it('stringifies uniqueCode and id', () => {
    const order = normalizeMemberOrder({
      uniqueCode: 12 as unknown as string,
      id: 34 as unknown as string,
    })
    expect(order.uniqueCode).toBe('12')
    expect(order.id).toBe('34')
  })

  it('maps payStatus including free(0) and has no status 3 pay code', () => {
    expect(memberOrderPayStatusText(0)).toBe('免费')
    expect(memberOrderPayStatusText(1)).toBe('已支付')
    expect(memberOrderPayStatusText(2)).toBe('未支付')
    expect(memberOrderPayStatusText(4)).toBe('已退款')
    expect(memberOrderPayStatusText()).toBe('-')
  })

  it('maps order status 1/2/3', () => {
    expect(memberOrderStatusText(1)).toBe('待支付/进行中')
    expect(memberOrderStatusText(2)).toBe('已完成')
    expect(memberOrderStatusText(3)).toBe('已取消')
  })

  it('maps pay way and platform labels', () => {
    expect(memberOrderPayWayText(1)).toBe('微信App')
    expect(memberOrderPayWayText(3)).toBe('微信H5')
    expect(memberOrderPayWayText(5)).toBe('支付宝')
    expect(memberOrderPayWayText(0 as CommunityMemberPayWay)).toBeUndefined()
    expect(memberOrderPayPlatformText(2)).toBe('微信小程序')
    expect(memberOrderPayPlatformText(5)).toBe('H5')
  })
})
