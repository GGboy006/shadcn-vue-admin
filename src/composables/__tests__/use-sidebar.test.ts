import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useSidebar } from '@/composables/use-sidebar'
import { useAuthStore } from '@/stores/auth'

interface LoginUserVO {
  nickname: string
  avatar: string
  gender: number
  phone: string
  userType: number
}

function setUser(userType: number) {
  useAuthStore().setUserInfo({
    nickname: '',
    avatar: '',
    gender: 0,
    phone: '',
    userType,
  } as LoginUserVO)
}

/** 提取菜单结构(忽略 icon 函数引用),便于深比较身份间是否一致 */
function snapshot(nav: unknown): string {
  return JSON.stringify(nav, (_key, value) =>
    typeof value === 'function' ? undefined : value)
}

/** 递归收集某分组下所有叶子菜单项的 title */
function leafTitles(group: { items: unknown[] }): string[] {
  return (group.items as Array<{ title: string, items?: unknown[] }>)
    .map(item => (item.items ? leafTitles({ items: item.items }) : item.title))
    .flat()
}

describe('useSidebar navData', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('商户(userType=4):通用 + 商户后台(含商户资料) + 设置', () => {
    setUser(4)
    const { navData } = useSidebar()

    expect(navData.value.map(g => g.title)).toEqual(['通用', '商户后台', '其他'])

    // 通用组:无站长专属(聊天工作台、商户/物业/居委会管理)
    expect(leafTitles(navData.value[0])).toEqual(['仪表盘', 'AI工具管理', '会话列表'])

    // 商户后台组:含商户资料
    expect(leafTitles(navData.value[1])).toEqual([
      '商户概览',
      '商户资料',
      '商品分类',
      '商品管理',
      'FAQ',
      '优惠活动',
      '订单管理',
    ])

    // 设置组:无站长信息
    expect(leafTitles(navData.value[2])).toEqual(['个人资料'])
  })

  it('物业(userType=5)菜单与商户自身一致', () => {
    setUser(4)
    const merchantSnapshot = snapshot(useSidebar().navData.value)

    setUser(5)
    const propertySnapshot = snapshot(useSidebar().navData.value)

    expect(propertySnapshot).toEqual(merchantSnapshot)
  })

  it('居委会(userType=6)菜单与商户自身一致(三种商户后台用户同级)', () => {
    setUser(4)
    const merchantSnapshot = snapshot(useSidebar().navData.value)

    setUser(6)
    const committeeSnapshot = snapshot(useSidebar().navData.value)

    expect(committeeSnapshot).toEqual(merchantSnapshot)
  })

  it('站长(userType=3):通用(含站长专属) + 设置(含站长信息),无商户后台', () => {
    setUser(3)
    const { navData } = useSidebar()

    expect(navData.value.map(g => g.title)).toEqual(['通用', '其他'])

    expect(leafTitles(navData.value[0])).toEqual([
      '仪表盘',
      '聊天工作台',
      'OPC 数字员工',
      'AI工具管理',
      '会话列表',
      '商户管理',
      '物业管理',
      '居委会管理',
    ])

    expect(leafTitles(navData.value[1])).toEqual(['个人资料', '站长信息'])
  })
})
