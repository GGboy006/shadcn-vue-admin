import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { useSidebar } from '@/composables/use-sidebar'
import { clearHousekeeperKind, housekeeperKind } from '@/services/api/housekeeper-partner.access'
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

  afterEach(() => {
    clearHousekeeperKind()
  })

  it('商户(userType=4):经营 + AI + 设置', () => {
    setUser(4)
    const { navData } = useSidebar()

    expect(navData.value.map(g => g.title)).toEqual(['经营', 'AI', '设置'])

    expect(leafTitles(navData.value[0])).toEqual([
      '概览',
      '订单管理',
      '商品管理',
      '商品分类',
      '优惠活动',
      '活动分类',
      '常见问题',
      '资料',
    ])

    expect(leafTitles(navData.value[1])).toEqual(['AI工具', '会话列表'])

    expect(leafTitles(navData.value[2])).toEqual(['个人资料'])
  })

  it('管家(userType=9):本馆资料 + 服务人员 + 服务订单 + 设置', () => {
    setUser(9)
    const { navData } = useSidebar()

    expect(navData.value.map(g => g.title)).toEqual(['本馆', '设置'])
    expect(leafTitles(navData.value[0])).toEqual(['本馆资料', '服务人员', '服务订单'])
    expect(leafTitles(navData.value[1])).toEqual(['个人资料'])
  })

  it('合作方(userType=9):服务人员 + 服务订单', () => {
    setUser(9)
    housekeeperKind().value = 'partner'
    const { navData } = useSidebar()

    expect(navData.value.map(g => g.title)).toEqual(['合作方', '设置'])
    expect(leafTitles(navData.value[0])).toEqual(['服务人员', '服务订单'])
  })

  it('物业(userType=5)不再走商户后台菜单', () => {
    setUser(5)
    const { navData } = useSidebar()

    expect(navData.value.map(g => g.title)).toEqual(['工作台', '主体管理', 'AI运营', '居民', '小区服务', '设置'])
    expect(navData.value.some(g => g.title === '经营')).toBe(false)
  })

  it('居委会(userType=6):走居委会专属菜单,与商户菜单不同', () => {
    setUser(6)
    const { navData } = useSidebar()

    expect(navData.value.map(g => g.title)).toEqual(['居委会后台', '设置'])

    expect(leafTitles(navData.value[0])).toEqual([
      '首页',
      '公告管理',
      '活动分类',
      '活动列表',
      '广告管理',
      '资讯动态',
      '栏目管理',
      '专题管理',
      '居委会信息',
      '服务热线',
      '在线留言',
      '村情数据',
      '财务公开',
      '党建管理',
      '报事报修',
      '积分管理',
      '村民议事',
      '书记信箱',
      '志愿服务',
      '矛盾调解',
      '养老服务',
      '医疗健康',
      '消防安全',
      '环境治理',
    ])
  })

  it('站长(userType=3):工作台 + 主体管理 + AI运营 + 居民 + 小区服务 + 设置', () => {
    setUser(3)
    const { navData } = useSidebar()

    expect(navData.value.map(g => g.title)).toEqual(['工作台', '主体管理', 'AI运营', '居民', '小区服务', '设置'])

    expect(leafTitles(navData.value[0])).toEqual(['数据看板'])

    expect(leafTitles(navData.value[1])).toEqual([
      '商户列表',
      '商户分类',
      '物业管理',
      '居委会管理',
    ])

    expect(leafTitles(navData.value[2])).toEqual([
      '聊天工作台',
      '数字员工',
      '居民AI服务',
      'AI工具管理',
      '会话列表',
    ])

    expect(leafTitles(navData.value[3])).toEqual(['居民管理', '会员套餐', '会员订单', '居民AI工具'])

    expect(navData.value[4].items.map(item => item.title)).toEqual([
      '内容',
      '便民',
      '意见反馈',
      '配置',
    ])

    expect(leafTitles(navData.value[4])).toEqual([
      '小区公告',
      '小区动态',
      '办事指南',
      '小区服务',
      '管家服务',
      '服务订单',
      '社区电话',
      '意见反馈',
      '小区栏目',
      '小区分类',
    ])

    expect(leafTitles(navData.value[5])).toEqual(['个人资料', '站长信息'])
  })
})
