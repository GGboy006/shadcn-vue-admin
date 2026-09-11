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

  it('物业(userType=5)不再走商户后台菜单', () => {
    setUser(5)
    const { navData } = useSidebar()

    expect(navData.value.map(g => g.title)).toEqual(['工作台', '主体管理', 'AI运营', '小区服务', '居民', '设置'])
    expect(navData.value.some(g => g.title === '经营')).toBe(false)
  })

  it('居委会(userType=6):走居委会专属菜单,与商户菜单不同', () => {
    setUser(6)
    const { navData } = useSidebar()

    // 居委会后台内容与商户差别巨大,走独立菜单组(非商户后台那套)
    expect(navData.value.map(g => g.title)).toEqual(['居委会后台', '设置'])

    // 居委会后台组:首页 + 公告/活动/广告/资讯/内容栏目 + 居委会信息等
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
    ])
  })

  it('站长(userType=3):工作台 + 主体管理 + AI运营 + 小区服务 + 居民 + 设置', () => {
    setUser(3)
    const { navData } = useSidebar()

    expect(navData.value.map(g => g.title)).toEqual(['工作台', '主体管理', 'AI运营', '小区服务', '居民', '设置'])

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
      'AI工具管理',
      '会话列表',
    ])

    expect(navData.value[3].items.map(item => item.title)).toEqual([
      '内容',
      '便民',
      '意见反馈',
      '配置',
    ])

    expect(leafTitles(navData.value[3])).toEqual([
      '小区公告',
      '小区动态',
      '知识服务',
      '办事指南',
      '小区服务',
      '管家服务',
      '社区电话',
      '意见反馈',
      '小区栏目',
      '小区分类',
    ])

    expect(leafTitles(navData.value[4])).toEqual(['居民管理', '居民AI工具'])

    expect(leafTitles(navData.value[5])).toEqual(['个人资料', '站长信息'])
  })
})
