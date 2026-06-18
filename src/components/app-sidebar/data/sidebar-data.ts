import { AudioWaveformIcon, CommandIcon, GalleryVerticalEndIcon } from '@lucide/vue'

import { useSidebar } from '@/composables/use-sidebar'
import { withBase } from '@/utils/with-base'

import type { SidebarData, Team, User } from '../types'

const user: User = {
  name: 'shadcn',
  email: 'm@example.com',
  avatar: withBase('/avatars/shadcn.jpg'),
}

const teams: Team[] = [
  {
    name: 'Acme Inc',
    logo: GalleryVerticalEndIcon,
    plan: 'Enterprise',
  },
  {
    name: 'Acme Corp.',
    logo: AudioWaveformIcon,
    plan: 'Startup',
  },
  {
    name: 'Evil Corp.',
    logo: CommandIcon,
    plan: 'Free',
  },
]

const { navData } = useSidebar()

// 注意：这里的 navMain 是 useSidebar() 调用时的静态快照，
// 不能响应 userType 变化。app-sidebar/index.vue 已直接调用 useSidebar() 获取 navData。
export const sidebarData: SidebarData = {
  user,
  teams,
  navMain: navData.value!,
}
