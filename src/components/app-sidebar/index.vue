<script lang="ts" setup>
import { useSidebar } from '@/composables/use-sidebar'
import { useAuthStore } from '@/stores/auth'
import { useUserInfoStore } from '@/stores/user-info'

import { sidebarData } from './data/sidebar-data'
import NavFooter from './nav-footer.vue'
import NavTeam from './nav-team.vue'
// TODO: 多小区/组织切换器占位组件，当前阶段关闭。
// 后续当“一个运营人员管理多个小区”时，可直接在下方启用 TeamSwitcher。
import TeamSwitcher from './team-switcher.vue'

const authStore = useAuthStore()
const userInfoStore = useUserInfoStore()

// 必须直接调用 useSidebar() 获取响应式 navData。
// sidebar-data.ts 里导出的是 navData.value 的静态快照，切换账号后不会更新。
const { navData } = useSidebar()

// 功能开关：当前关闭多小区切换器，未来可直接开启 TeamSwitcher
const enableCommunitySwitch = false

// 根据角色动态显示左上角名称
const userType = computed(() => authStore.userInfo?.userType)
const isStationMaster = computed(() => userType.value === 3)
const isMerchant = computed(() => userType.value === 4 || userType.value === 5)

const sidebarTitle = computed(() => {
  if (isStationMaster.value)
    return '小区站长驾驶舱'
  if (isMerchant.value)
    return userInfoStore.merchantInfo?.merchantName || '商户工作台'
  return '小区站长'
})
</script>

<template>
  <UiSidebar collapsible="icon" class="z-50">
    <UiSidebarHeader>
      <template v-if="enableCommunitySwitch">
        <TeamSwitcher :teams="sidebarData.teams" />
      </template>
      <template v-else>
        <!-- 当前阶段占位：根据用户角色展示名称，后续可替换/并入多小区切换器 -->
        <div class="flex items-center gap-2 px-2 h-12">
          <div class="flex items-center justify-center rounded-lg aspect-square size-8 bg-sidebar-primary text-sidebar-primary-foreground">
            <span class="text-sm font-bold">{{ sidebarTitle.charAt(0) }}</span>
          </div>
          <div class="grid flex-1 text-sm leading-tight text-left">
            <span class="font-semibold truncate">{{ sidebarTitle }}</span>
          </div>
        </div>
      </template>
    </UiSidebarHeader>

    <UiSidebarContent>
      <NavTeam :nav-main="navData" />
    </UiSidebarContent>

    <UiSidebarFooter>
      <NavFooter />
    </UiSidebarFooter>

    <UiSidebarRail />
  </UiSidebar>
</template>
