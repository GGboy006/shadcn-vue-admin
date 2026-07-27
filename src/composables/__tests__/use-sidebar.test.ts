import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useSidebar } from '@/composables/use-sidebar'
import { useAuthStore } from '@/stores/auth'
import { useMerchantBusinessStore } from '@/stores/merchant-business'

interface LoginUserVO {
  nickname: string
  avatar: string
  gender: number
  phone: string
  userType: number
}

function setUser(userType: number) {
  const auth = useAuthStore()
  auth.setUserInfo({
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

  it('商户自身(userType=4):通用 + 商户后台(含商户资料) + 设置', () => {
    setUser(4)
    const { navData } = useSidebar()

    const groups = navData.value.map(g => g.title)
    expect(groups).toEqual(['通用', '商户后台', '其他'])

    // 通用组:无站长专属(聊天工作台、商户/物业管理)
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

  it('站长代客(userType=3 + proxyMode)菜单与商户自身完全一致', () => {
    const mbStore = useMerchantBusinessStore()
    const { navData } = useSidebar()

    // 商户自身快照
    setUser(4)
    const merchantSnapshot = snapshot(navData.value)

    // 切到站长代客
    setUser(3)
    mbStore.enterProxy('M1', '测试商户')
    const proxySnapshot = snapshot(navData.value)

    expect(proxySnapshot).toEqual(merchantSnapshot)
  })

  it('站长原窗口(userType=3, 非代客):通用(含站长专属) + 设置(含站长信息),无商户后台', () => {
    setUser(3)
    const { navData } = useSidebar()

    const groups = navData.value.map(g => g.title)
    expect(groups).toEqual(['通用', '其他'])

    expect(leafTitles(navData.value[0])).toEqual([
      '仪表盘',
      '聊天工作台',
      'AI工具管理',
      '会话列表',
      '商户/物业管理',
    ])

    expect(leafTitles(navData.value[1])).toEqual(['个人资料', '站长信息'])
  })

  it('物业自身(userType=5)菜单与商户自身一致', () => {
    const { navData } = useSidebar()

    setUser(4)
    const merchantSnapshot = snapshot(navData.value)

    setUser(5)
    const propertySnapshot = snapshot(navData.value)

    expect(propertySnapshot).toEqual(merchantSnapshot)
  })
})
