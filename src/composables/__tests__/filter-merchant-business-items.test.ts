import { describe, expect, it } from 'vitest'

import type { NavItem } from '@/components/app-sidebar/types'

import { filterMerchantBusinessItems } from '@/composables/filter-merchant-business-items'

const items: (NavItem & { selfOnly?: boolean })[] = [
  { title: '商户概览', url: '/merchant-business/overview' },
  { title: '商户资料', url: '/merchant-business/profile', selfOnly: true },
  { title: '商品分类', url: '/merchant-business/category' },
  { title: '商品管理', url: '/merchant-business/goods' },
  { title: 'FAQ', url: '/merchant-business/faq' },
  { title: '优惠活动', url: '/merchant-business/activity' },
  { title: '订单管理', url: '/merchant-business/order' },
]

describe('filterMerchantBusinessItems', () => {
  it('should keep all items for merchant (userType=4) self mode', () => {
    const result = filterMerchantBusinessItems(items, { userType: 4, proxyMode: false })

    expect(result.map(i => i.title)).toEqual([
      '商户概览',
      '商户资料',
      '商品分类',
      '商品管理',
      'FAQ',
      '优惠活动',
      '订单管理',
    ])
  })

  it('should keep all items for property (userType=5) self mode', () => {
    const result = filterMerchantBusinessItems(items, { userType: 5, proxyMode: false })

    expect(result.map(i => i.title)).toHaveLength(7)
    expect(result.map(i => i.title)).toContain('商户资料')
  })

  it('should hide selfOnly items for station master proxy mode (userType=3)', () => {
    const result = filterMerchantBusinessItems(items, { userType: 3, proxyMode: true })

    expect(result.map(i => i.title)).toEqual([
      '商户概览',
      '商品分类',
      '商品管理',
      'FAQ',
      '优惠活动',
      '订单管理',
    ])
    expect(result.map(i => i.title)).not.toContain('商户资料')
  })

  it('should hide selfOnly items when userType unknown but in proxy mode', () => {
    const result = filterMerchantBusinessItems(items, { userType: undefined, proxyMode: true })

    expect(result.map(i => i.title)).not.toContain('商户资料')
    // 商户概览非 selfOnly,代客态保留
    expect(result.map(i => i.title)).toContain('商户概览')
  })
})
