import { BoxesIcon, FolderTreeIcon, HeadsetIcon, HelpCircleIcon, LayoutDashboardIcon, MessageSquareIcon, PackageIcon, SettingsIcon, ShoppingCartIcon, StoreIcon, TagIcon, UserIcon, UsersIcon, WrenchIcon } from '@lucide/vue'

import type { NavGroup, NavItem } from '@/components/app-sidebar/types'

import { filterMerchantBusinessItems } from '@/composables/filter-merchant-business-items'
import { filterNavItemsByRoles } from '@/composables/filter-nav-items-by-roles'
import { useMerchantBusinessStore } from '@/stores/merchant-business'

export function useSidebar() {
  const authStore = useAuthStore()
  const merchantBusinessStore = useMerchantBusinessStore()

  // 必须用 computed 包裹,否则退出登录换账号后 userType 不会更新。
  // 之前用 const userType = authStore.getUserType() 只读取了一次快照。
  const userType = computed(() => authStore.userInfo?.userType)
  const proxyMode = computed(() => merchantBusinessStore.proxyMode)

  // 代客模式下,菜单按商户身份呈现,与商户自己登录一致(通用/商户后台/设置三组)
  const effectiveUserType = computed(() => {
    if (userType.value === 3 && proxyMode.value)
      return 4
    return userType.value
  })

  /** 商户后台菜单项(selfOnly 当前预留:代客态已与商户一致,不再据此过滤) */
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
    { title: 'AI工具管理', url: '/apps', icon: BoxesIcon },
    { title: '会话列表', url: '/conversations', icon: MessageSquareIcon },
    { title: '商户/物业管理', url: '/merchants', icon: UsersIcon, roles: [3] },
  ]

  const allSettingsNavItems = [
    { title: '个人资料', url: '/settings/', icon: UserIcon },
    { title: '站长信息', url: '/settings/account', icon: WrenchIcon, roles: [3] },
    // { title: '外观', url: '/settings/appearance', icon: PaletteIcon },
    // { title: '通知', url: '/settings/notifications', icon: BellDotIcon },
    // { title: '显示', url: '/settings/display', icon: PictureInPicture2Icon },
  ]

  // settings 子菜单也需要随 userType 重新过滤
  const settingsNavItems = computed(() => filterNavItemsByRoles(allSettingsNavItems, effectiveUserType.value))

  /** 商户/物业自身 + 站长代客:通用菜单 + 商户后台 + 设置(代客态经 effectiveUserType 按商户身份呈现) */
  const merchantSelfNavData = computed<NavGroup[]>(() => [
    {
      title: '通用',
      items: filterNavItemsByRoles(commonNavItems, effectiveUserType.value),
    },
    {
      title: '商户后台',
      items: filterMerchantBusinessItems(merchantBusinessNavItems, {
        userType: effectiveUserType.value,
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
      items: filterNavItemsByRoles(commonNavItems, effectiveUserType.value),
    },
    {
      title: '其他',
      items: [
        { title: '设置', items: settingsNavItems.value, icon: SettingsIcon },
      ],
    },
  ])

  // 最终菜单:站长原窗口 vs 商户视角(商户/物业自身 + 站长代客)
  const navData = computed<NavGroup[]>(() => {
    // 商户/物业自身 或 站长代客:统一用商户菜单(代客态经 effectiveUserType 模拟商户身份)
    if (userType.value === 4 || userType.value === 5 || (userType.value === 3 && proxyMode.value)) {
      return merchantSelfNavData.value
    }
    // 站长原窗口(及其他默认)
    return stationNavData.value
  })

  const otherPages = ref<NavGroup[]>([])

  return {
    navData,
    otherPages,
    settingsNavItems,
  }
}
