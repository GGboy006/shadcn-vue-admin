<script lang="ts" setup>
import { useSidebar } from '@/composables/use-sidebar'
import { isMerchantBusinessUser } from '@/constants/user-type'
import { housekeeperKind } from '@/services/api/housekeeper-partner.access'
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
const isMerchant = computed(() => isMerchantBusinessUser(userType.value))

const sidebarTitle = computed(() => {
  if (isStationMaster.value)
    return '小区站长驾驶舱'
  if (housekeeperKind().value === 'partner')
    return '合作方工作台'
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
        <div class="flex h-12 items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <span class="text-sm font-bold">{{ sidebarTitle.charAt(0) }}</span>
          </div>
          <div class="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span class="truncate font-semibold">{{ sidebarTitle }}</span>
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
  </UiSidebar>
</template>
