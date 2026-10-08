import { BookmarkIcon, BookOpenIcon, BotIcon, BoxesIcon, Building2Icon, CalendarDaysIcon, CalendarRangeIcon, Columns3Icon, ConciergeBellIcon, CreditCardIcon, FolderTreeIcon, HeadsetIcon, HelpCircleIcon, HomeIcon, ImageIcon, LandmarkIcon, LayoutDashboardIcon, LayoutGridIcon, LibraryIcon, LifeBuoyIcon, LightbulbIcon, ListOrderedIcon, MegaphoneIcon, MessageSquareIcon, NewspaperIcon, PackageIcon, PhoneIcon, ReceiptIcon, ShoppingCartIcon, StoreIcon, TagIcon, TagsIcon, UserIcon, UsersIcon, WrenchIcon } from '@lucide/vue'

import type { NavGroup, NavItem } from '@/components/app-sidebar/types'

import { filterMerchantBusinessItems } from '@/composables/filter-merchant-business-items'
import { filterNavItemsByRoles } from '@/composables/filter-nav-items-by-roles'
import { isMerchantBusinessUser, UserType } from '@/constants/user-type'

export function useSidebar() {
  const authStore = useAuthStore()

  const userType = computed(() => authStore.userInfo?.userType)

  const merchantBusinessNavItems: NavItem[] = [
    { title: '概览', url: '/merchant-business/overview', icon: LayoutDashboardIcon },
    { title: '订单管理', url: '/merchant-business/order', icon: ShoppingCartIcon },
    {
      title: '商品',
      icon: PackageIcon,
      items: [
        { title: '商品管理', url: '/merchant-business/goods', icon: PackageIcon },
        { title: '商品分类', url: '/merchant-business/category', icon: FolderTreeIcon },
      ],
    },
    {
      title: '活动',
      icon: TagIcon,
      items: [
        { title: '优惠活动', url: '/merchant-business/activity', icon: TagIcon },
        { title: '活动分类', url: '/merchant-business/activity-cate', icon: TagsIcon },
      ],
    },
    { title: '常见问题', url: '/merchant-business/faq', icon: HelpCircleIcon },
    { title: '资料', url: '/merchant-business/profile', icon: StoreIcon, selfOnly: true },
  ]

  const merchantAiNavItems: NavItem[] = [
    { title: 'AI工具', url: '/apps', icon: BoxesIcon },
    { title: '会话列表', url: '/conversations', icon: MessageSquareIcon },
  ]

  const stationWorkbenchNavItems: NavItem[] = [
    { title: '数据看板', url: '/dashboard', icon: LayoutDashboardIcon, roles: [3] },
  ]

  const stationEntityNavItems: NavItem[] = [
    {
      title: '商户管理',
      icon: StoreIcon,
      roles: [3],
      items: [
        { title: '商户列表', url: '/merchants', icon: StoreIcon, roles: [3] },
        { title: '商户分类', url: '/merchants/category', icon: FolderTreeIcon, roles: [3] },
      ],
    },
    { title: '物业管理', url: '/properties', icon: Building2Icon, roles: [3] },
    { title: '居委会管理', url: '/committees', icon: LandmarkIcon, roles: [3] },
  ]

  const communityServiceNavItems: NavItem[] = [
    {
      title: '内容',
      icon: NewspaperIcon,
      roles: [3],
      items: [
        { title: '小区公告', url: '/community/announcement', icon: MegaphoneIcon, roles: [3] },
        { title: '小区动态', url: '/community/news', icon: NewspaperIcon, roles: [3] },
        { title: '知识服务', url: '/community/knowledge', icon: LightbulbIcon, roles: [3] },
      ],
    },
    {
      title: '便民',
      icon: LifeBuoyIcon,
      roles: [3],
      items: [
        { title: '办事指南', url: '/community/guide', icon: BookOpenIcon, roles: [3] },
        { title: '小区服务', url: '/community/service', icon: LifeBuoyIcon, roles: [3] },
        { title: '管家服务', url: '/community/steward', icon: ConciergeBellIcon, roles: [3] },
        { title: '服务订单', url: '/community/steward-orders', icon: ListOrderedIcon, roles: [3] },
        { title: '社区电话', url: '/community/phone-list', icon: PhoneIcon, roles: [3] },
      ],
    },
    { title: '意见反馈', url: '/community/feedback', icon: MessageSquareIcon, roles: [3] },
    {
      title: '配置',
      icon: LayoutGridIcon,
      roles: [3],
      items: [
        { title: '小区栏目', url: '/community/column', icon: Columns3Icon, roles: [3] },
        { title: '小区分类', url: '/community/cate', icon: FolderTreeIcon, roles: [3] },
      ],
    },
  ]

  const residentNavItems: NavItem[] = [
    { title: '居民管理', url: '/community/resident', icon: UsersIcon, roles: [3] },
    { title: '会员套餐', url: '/community/member-package', icon: CreditCardIcon, roles: [3] },
    { title: '会员订单', url: '/community/member-orders', icon: ReceiptIcon, roles: [3] },
    { title: '居民AI工具', url: '/community/ai-tool', icon: BotIcon, roles: [3] },
  ]

  const stationAiNavItems: NavItem[] = [
    { title: '聊天工作台', url: '/admin/chat-workbench', icon: HeadsetIcon, roles: [3] },
    { title: '数字员工', url: '/digital-employees', icon: BotIcon, roles: [3] },
    { title: '居民AI服务', url: '/community/capability', icon: LibraryIcon, roles: [3] },
    { title: 'AI工具管理', url: '/apps', icon: BoxesIcon, roles: [3] },
    { title: '会话列表', url: '/conversations', icon: MessageSquareIcon, roles: [3] },
  ]

  const neighborhoodNavItems: NavItem[] = [
    { title: '首页', url: '/neighborhood/home', icon: HomeIcon },
    { title: '公告管理', url: '/neighborhood/notice', icon: MegaphoneIcon },
    {
      title: '活动管理',
      icon: CalendarDaysIcon,
      items: [
        { title: '活动分类', url: '/neighborhood/activity-cate', icon: FolderTreeIcon },
        { title: '活动列表', url: '/neighborhood/activity', icon: CalendarRangeIcon },
      ],
    },
    { title: '广告管理', url: '/neighborhood/banner', icon: ImageIcon },
    { title: '资讯动态', url: '/neighborhood/dynamic', icon: NewspaperIcon },
    {
      title: '内容栏目',
      icon: LayoutGridIcon,
      items: [
        { title: '栏目管理', url: '/neighborhood/unified', icon: Columns3Icon },
        { title: '专题管理', url: '/neighborhood/special', icon: BookmarkIcon },
      ],
    },
    { title: '居委会信息', url: '/neighborhood/org-info', icon: Building2Icon },
    { title: '服务热线', url: '/neighborhood/service-guide', icon: PhoneIcon },
    { title: '在线留言', url: '/neighborhood/leave-message', icon: MessageSquareIcon },
    // 居委会服务 /neighborhood/service 暂不开放

  ]

  const allSettingsNavItems = [
    { title: '个人资料', url: '/settings/', icon: UserIcon },
    { title: '站长信息', url: '/settings/account', icon: WrenchIcon, roles: [3] },
  ]

  const settingsNavItems = computed(() => filterNavItemsByRoles(allSettingsNavItems, userType.value))

  function settingsGroup(): NavGroup {
    return {
      title: '设置',
      items: settingsNavItems.value,
    }
  }

  const merchantSelfNavData = computed<NavGroup[]>(() => {
    if (userType.value === UserType.committee) {
      return [
        { title: '居委会后台', items: neighborhoodNavItems },
        settingsGroup(),
      ]
    }

    return [
      {
        title: '经营',
        items: filterMerchantBusinessItems(merchantBusinessNavItems, {
          userType: userType.value,
          proxyMode: false,
        }),
      },
      { title: 'AI', items: merchantAiNavItems },
      settingsGroup(),
    ]
  })

  const stationNavData = computed<NavGroup[]>(() => [
    { title: '工作台', items: filterNavItemsByRoles(stationWorkbenchNavItems, userType.value) },
    { title: '主体管理', items: filterNavItemsByRoles(stationEntityNavItems, userType.value) },
    { title: 'AI运营', items: filterNavItemsByRoles(stationAiNavItems, userType.value) },
    { title: '居民', items: filterNavItemsByRoles(residentNavItems, userType.value) },
    { title: '小区服务', items: filterNavItemsByRoles(communityServiceNavItems, userType.value) },
    settingsGroup(),
  ])

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
