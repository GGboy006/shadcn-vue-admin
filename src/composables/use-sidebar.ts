import { BadgeHelpIcon, BellDotIcon, BirdIcon, BoxesIcon, BugIcon, ComponentIcon, CreditCardIcon, LayoutDashboardIcon, ListTodoIcon, PaletteIcon, PictureInPicture2Icon, PodcastIcon, SettingsIcon, SquareUserRoundIcon, UserIcon, UsersIcon, WrenchIcon } from '@lucide/vue'

import type { NavGroup } from '@/components/app-sidebar/types'

export function useSidebar() {
  const settingsNavItems = [
    { title: '个人资料', url: '/settings/', icon: UserIcon },
    { title: '账户', url: '/settings/account', icon: WrenchIcon },
    { title: '外观', url: '/settings/appearance', icon: PaletteIcon },
    { title: '通知', url: '/settings/notifications', icon: BellDotIcon },
    { title: '显示', url: '/settings/display', icon: PictureInPicture2Icon },
  ]

  const navData = ref<NavGroup[]> ([
    {
      title: '通用',
      items: [
        { title: '仪表盘', url: '/dashboard', icon: LayoutDashboardIcon },
        { title: '任务', url: '/tasks', icon: ListTodoIcon },
        { title: '应用', url: '/apps', icon: BoxesIcon },
        { title: '用户', url: '/users', icon: UsersIcon },
        { title: 'AI 对话示例', url: '/ai-talk', icon: PodcastIcon },
      ],
    },
    {
      title: '页面',
      items: [
        {
          title: '认证',
          icon: SquareUserRoundIcon,
          items: [
            { title: '登录', url: '/auth/sign-in' },
            { title: '登录(双栏)', url: '/auth/sign-in-2' },
            { title: '注册', url: '/auth/sign-up' },
            { title: '忘记密码', url: '/auth/forgot-password' },
            { title: '验证码', url: '/auth/otp' },
          ],
        },
        {
          title: '错误',
          icon: BugIcon,
          items: [
            { title: '401 | 未授权', url: '/errors/401' },
            { title: '403 | 禁止访问', url: '/errors/403' },
            { title: '404 | 页面不存在', url: '/errors/404' },
            { title: '500 | 服务器内部错误', url: '/errors/500' },
            { title: '503 | 维护中', url: '/errors/503' },
          ],
        },
      ],
    },
    {
      title: '其他',
      items: [
        { title: '设置', items: settingsNavItems, icon: SettingsIcon },
        { title: '组件属性', url: '/prop-components', icon: ComponentIcon },
        { title: '帮助中心', url: '/help-center', icon: BadgeHelpIcon },
        { title: '外部页面(GitHub)', url: 'https://www.github.com/Whbbit1999/shadcn-vue-admin', icon: BirdIcon },
      ],
    },
  ])

  const otherPages = ref<NavGroup[]>([
    {
      title: '其他',
      items: [
        { title: '套餐与定价', icon: CreditCardIcon, url: '/billing' },
      ],
    },
  ])

  return {
    navData,
    otherPages,
    settingsNavItems,
  }
}
