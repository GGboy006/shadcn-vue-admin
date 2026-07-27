import { describe, expect, it } from 'vitest'

import type { NavItem } from '@/components/app-sidebar/types'

import { filterNavItemsByRoles } from '@/composables/filter-nav-items-by-roles'

const items: NavItem[] = [
  { title: '仪表盘', url: '/dashboard' },
  { title: '聊天工作台', url: '/admin/chat-workbench', roles: [3] },
  { title: 'AI工具管理', url: '/apps' },
  { title: '会话列表', url: '/conversations' },
  { title: '商户/物业管理', url: '/merchants', roles: [3] },
]

describe('filterNavItemsByRoles', () => {
  it('should keep all items for station master (userType=3)', () => {
    const result = filterNavItemsByRoles(items, 3)

    expect(result.map(i => i.title)).toEqual([
      '仪表盘',
      '聊天工作台',
      'AI工具管理',
      '会话列表',
      '商户/物业管理',
    ])
  })

  it('should hide roles-restricted items for merchant (userType=4)', () => {
    const result = filterNavItemsByRoles(items, 4)

    expect(result.map(i => i.title)).toEqual([
      '仪表盘',
      'AI工具管理',
      '会话列表',
    ])
    expect(result.map(i => i.title)).not.toContain('聊天工作台')
    expect(result.map(i => i.title)).not.toContain('商户/物业管理')
  })

  it('should hide roles-restricted items for property (userType=5)', () => {
    const result = filterNavItemsByRoles(items, 5)

    expect(result.map(i => i.title)).toEqual([
      '仪表盘',
      'AI工具管理',
      '会话列表',
    ])
  })

  it('should hide roles-restricted items when userType unknown (undefined)', () => {
    const result = filterNavItemsByRoles(items, undefined)

    expect(result.map(i => i.title)).toEqual([
      '仪表盘',
      'AI工具管理',
      '会话列表',
    ])
  })

  it('should respect multi-role items', () => {
    const multiRoleItems: NavItem[] = [
      { title: '全员可见', url: '/a' },
      { title: '仅站长和商户', url: '/b', roles: [3, 4] },
    ]

    expect(filterNavItemsByRoles(multiRoleItems, 3).map(i => i.title)).toContain('仅站长和商户')
    expect(filterNavItemsByRoles(multiRoleItems, 4).map(i => i.title)).toContain('仅站长和商户')
    expect(filterNavItemsByRoles(multiRoleItems, 5).map(i => i.title)).not.toContain('仅站长和商户')
  })

  it('should return empty array for empty input', () => {
    expect(filterNavItemsByRoles([], 3)).toEqual([])
  })
})
