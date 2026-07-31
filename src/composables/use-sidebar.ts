import { BookOpenIcon, BotIcon, BoxesIcon, Building2Icon, ConciergeBellIcon, FolderTreeIcon, HandHelpingIcon, HeadsetIcon, HelpCircleIcon, LandmarkIcon, LayoutDashboardIcon, LightbulbIcon, MegaphoneIcon, MessageSquareIcon, NewspaperIcon, PackageIcon, PhoneIcon, SettingsIcon, ShoppingCartIcon, SparklesIcon, StoreIcon, TagIcon, UserIcon, WrenchIcon } from '@lucide/vue'

import type { NavGroup, NavItem } from '@/components/app-sidebar/types'

import { filterMerchantBusinessItems } from '@/composables/filter-merchant-business-items'
import { filterNavItemsByRoles } from '@/composables/filter-nav-items-by-roles'
import { isMerchantBusinessUser } from '@/constants/user-type'

export function useSidebar() {
  const authStore = useAuthStore()

  // 必须用 computed 包裹,否则退出登录换账号后 userType 不会更新。
  // 之前用 const userType = authStore.getUserType() 只读取了一次快照。
  const userType = computed(() => authStore.userInfo?.userType)

  /** 商户后台菜单项(selfOnly 当前预留:代客标签页已换为商户 token,userType 即商户,不再据此过滤) */
  const merchantBusinessNavItems: NavItem[] = [
    { title: '商户概览', url: '/merchant-business/overview', icon: LayoutDashboardIcon },
    { title: '商户资料', url: '/merchant-business/profile', icon: StoreIcon, selfOnly: true },
    { title: '商品分类', url: '/merchant-business/category', icon: FolderTreeIcon },
    { title: '商品管理', url: '/merchant-business/goods', icon: PackageIcon },
    { title: 'FAQ', url: '/merchant-business/faq', icon: HelpCircleIcon },
    { title: '优惠活动', url: '/merchant-business/activity', icon: TagIcon },
    { title: '订单管理', url: '/merchant-business/order', icon: ShoppingCartIcon },
  ]

  /** 通用菜单项;roles:[3] 为站长专属,商户/物业经 filterNavItemsByRoles 过滤掉 */
  const commonNavItems: NavItem[] = [
    { title: '仪表盘', url: '/dashboard', icon: LayoutDashboardIcon },
    { title: '聊天工作台', url: '/admin/chat-workbench', icon: HeadsetIcon, roles: [3] },
    {
      title: 'AI服务管理',
      icon: SparklesIcon,
      items: [
        { title: 'OPC 数字员工', url: '/digital-employees', icon: BotIcon, roles: [3] },
        { title: 'AI工具管理', url: '/apps', icon: BoxesIcon },
      ],
    },
    { title: '会话列表', url: '/conversations', icon: MessageSquareIcon },
    { title: '商户管理', url: '/merchants', icon: StoreIcon, roles: [3] },
    { title: '物业管理', url: '/properties', icon: Building2Icon, roles: [3] },
    { title: '居委会管理', url: '/committees', icon: LandmarkIcon, roles: [3] },
  ]

  /** 小区服务菜单项;roles:[3] 为站长专属,仅站长可见;页面为占位,后续再开发具体内容 */
  const communityServiceNavItems: NavItem[] = [
    { title: '社区电话列表', url: '/community/phone-list', icon: PhoneIcon, roles: [3] },
    { title: '小区动态', url: '/community/news', icon: NewspaperIcon, roles: [3] },
    { title: '小区公告', url: '/community/announcement', icon: MegaphoneIcon, roles: [3] },
    { title: '办事指南', url: '/community/guide', icon: BookOpenIcon, roles: [3] },
    { title: '便民服务', url: '/community/convenience', icon: HandHelpingIcon, roles: [3] },
    { title: '知识服务', url: '/community/knowledge', icon: LightbulbIcon, roles: [3] },
    { title: '管家服务', url: '/community/steward', icon: ConciergeBellIcon, roles: [3] },
  ]

  const allSettingsNavItems = [
    { title: '个人资料', url: '/settings/', icon: UserIcon },
    { title: '站长信息', url: '/settings/account', icon: WrenchIcon, roles: [3] },
    // { title: '外观', url: '/settings/appearance', icon: PaletteIcon },
    // { title: '通知', url: '/settings/notifications', icon: BellDotIcon },
    // { title: '显示', url: '/settings/display', icon: PictureInPicture2Icon },
  ]

  // settings 子菜单也需要随 userType 重新过滤
  const settingsNavItems = computed(() => filterNavItemsByRoles(allSettingsNavItems, userType.value))

  /** 商户/物业(含代客标签页,已换商户 token,userType 即 4/5):通用菜单 + 商户后台 + 设置 */
  const merchantSelfNavData = computed<NavGroup[]>(() => [
    {
      title: '通用',
      items: filterNavItemsByRoles(commonNavItems, userType.value),
    },
    {
      title: '商户后台',
      items: filterMerchantBusinessItems(merchantBusinessNavItems, {
        userType: userType.value,
        proxyMode: false,
      }),
    },
    {
      title: '其他',
      items: [
        { title: '设置', items: settingsNavItems.value, icon: SettingsIcon },
      ],
    },
  ])

  /** 站长原窗口:保持原有菜单 */
  const stationNavData = computed<NavGroup[]>(() => [
    {
      title: '通用',
      items: filterNavItemsByRoles(commonNavItems, userType.value),
    },
    {
      title: '小区服务',
      items: filterNavItemsByRoles(communityServiceNavItems, userType.value),
    },
    {
      title: '其他',
      items: [
        { title: '设置', items: settingsNavItems.value, icon: SettingsIcon },
      ],
    },
  ])

  // 最终菜单:商户/物业/居委会(含代客标签页)用商户菜单;站长原窗口用站长菜单。
  // 代客标签页因换商户 token,userType 已是 4/5/6,天然走商户菜单,无需特殊分支。
  const navData = computed<NavGroup[]>(() => {
    if (isMerchantBusinessUser(userType.value))
      return merchantSelfNavData.value
    return stationNavData.value
  })

  const otherPages = ref<NavGroup[]>([])

  return {
    navData,
    otherPages,
    settingsNavItems,
  }
}
