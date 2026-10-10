<script setup lang="ts">
import { ChevronsUpDownIcon, LogOutIcon, UserRoundCogIcon } from '@lucide/vue'
import { storeToRefs } from 'pinia'

import { useSidebar } from '@/components/ui/sidebar'

const authStore = useAuthStore()
const { userInfo } = storeToRefs(authStore)
const { logout } = useAuth()
const { isMobile, open } = useSidebar()
</script>

<template>
  <UiSidebarMenu>
    <UiSidebarMenuItem>
      <UiDropdownMenu>
        <UiDropdownMenuTrigger as-child>
          <UiSidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <UiAvatar class="size-8 rounded-lg">
              <UiAvatarImage :src="userInfo?.avatar || ''" :alt="userInfo?.nickname || ''" />
              <UiAvatarFallback class="rounded-lg">
                {{ userInfo?.nickname?.slice(0, 1) || '用户' }}
              </UiAvatarFallback>
            </UiAvatar>
            <div class="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span class="truncate font-semibold">{{ userInfo?.nickname }}</span>
              <span class="truncate text-xs">{{ userInfo?.phone }}</span>
            </div>
            <ChevronsUpDownIcon class="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
          </UiSidebarMenuButton>
        </UiDropdownMenuTrigger>
        <UiDropdownMenuContent
          class="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          :side="(isMobile || open) ? 'bottom' : 'right'"
          align="start"
          :side-offset="4"
        >
          <UiDropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <UiAvatar class="size-8 rounded-lg">
                <UiAvatarImage :src="userInfo?.avatar || ''" :alt="userInfo?.nickname || ''" />
                <UiAvatarFallback class="rounded-lg">
                  {{ userInfo?.nickname?.slice(0, 2) || '用户' }}
                </UiAvatarFallback>
              </UiAvatar>
              <div class="grid flex-1 text-sm leading-tight text-left">
                <span class="font-semibold truncate">{{ userInfo?.nickname }}</span>
                <span class="text-xs truncate">{{ userInfo?.phone }}</span>
              </div>
            </div>
          </UiDropdownMenuLabel>

          <!-- <UiDropdownMenuSeparator />
          <UiDropdownMenuGroup>
            <UiDropdownMenuItem @click="$router.push('/billing/')">
              <SparklesIcon />
              Upgrade to Pro
            </UiDropdownMenuItem>
          </UiDropdownMenuGroup>

          <UiDropdownMenuSeparator />
          <UiDropdownMenuGroup>
            <UiDropdownMenuItem @click="$router.push('/billing?type=billing')">
              <CreditCardIcon />
              Billing
            </UiDropdownMenuItem>
          </UiDropdownMenuGroup> -->

          <UiDropdownMenuSeparator />
          <UiDropdownMenuGroup>
            <UiDropdownMenuItem @click="$router.push('/settings/')">
              <UserRoundCogIcon />
              个人资料
            </UiDropdownMenuItem>
            <!-- <UiDropdownMenuItem @click="$router.push('/settings/account')">
              <BadgeCheckIcon />
              站长信息
            </UiDropdownMenuItem> -->
            <!-- <UiDropdownMenuItem @click="$router.push('/settings/notifications')">
              <BellIcon />
              通知
            </UiDropdownMenuItem> -->
          </UiDropdownMenuGroup>

          <UiDropdownMenuSeparator />
          <UiDropdownMenuItem @click="logout">
            <LogOutIcon />
            {{ $t('logout') }}
          </UiDropdownMenuItem>
        </UiDropdownMenuContent>
      </UiDropdownMenu>
    </UiSidebarMenuItem>
  </UiSidebarMenu>
</template>
