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

  describe('nested items (二级菜单)', () => {
    const nestedItems: NavItem[] = [
      {
        title: 'AI服务管理',
        items: [
          { title: 'OPC 数字员工', url: '/digital-employees', roles: [3] },
          { title: 'AI工具管理', url: '/apps' },
        ],
      },
      { title: '仪表盘', url: '/dashboard' },
    ]

    it('keeps parent + all children for station master (userType=3)', () => {
      const result = filterNavItemsByRoles(nestedItems, 3)
      expect(result.map(i => i.title)).toEqual(['AI服务管理', '仪表盘'])
      const parent = result[0]
      expect(parent.items?.map(i => i.title)).toEqual(['OPC 数字员工', 'AI工具管理'])
    })

    it('filters out restricted children but keeps parent for merchant (userType=4)', () => {
      const result = filterNavItemsByRoles(nestedItems, 4)
      expect(result.map(i => i.title)).toEqual(['AI服务管理', '仪表盘'])
      const parent = result[0]
      expect(parent.items?.map(i => i.title)).toEqual(['AI工具管理'])
    })

    it('hides parent when all children are filtered out', () => {
      const allRestricted: NavItem[] = [
        {
          title: '站长专属组',
          items: [
            { title: '菜单A', url: '/a', roles: [3] },
            { title: '菜单B', url: '/b', roles: [3] },
          ],
        },
        { title: '仪表盘', url: '/dashboard' },
      ]
      const result = filterNavItemsByRoles(allRestricted, 4)
      expect(result.map(i => i.title)).toEqual(['仪表盘'])
    })
  })

  it('keeps flat behavior unchanged (backward compatible)', () => {
    const flat: NavItem[] = [
      { title: '仪表盘', url: '/dashboard' },
      { title: '站长专属', url: '/x', roles: [3] },
    ]
    expect(filterNavItemsByRoles(flat, 4).map(i => i.title)).toEqual(['仪表盘'])
    expect(filterNavItemsByRoles(flat, 3).map(i => i.title)).toEqual(['仪表盘', '站长专属'])
  })
})
