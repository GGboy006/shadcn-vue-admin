<script lang="ts" setup>
import { ChevronRightIcon, ExternalLinkIcon } from '@lucide/vue'

import { useSidebar } from '@/components/ui/sidebar'
import { isExternalUrl } from '@/utils/is-external-url'

import type { NavGroup, NavItem } from './types'

import MenuButton from './menu-button.vue'

const { navMain } = defineProps<{
  navMain: NavGroup[]
}>()

const route = useRoute()

const { state, isMobile } = useSidebar()

function isCollapsed(menu: NavItem): boolean {
  const pathname = route.path
  return !!menu.items?.some(item => isPathActive(pathname, item.url))
}

function isActive(menu: NavItem): boolean {
  const pathname = route.path
  if (menu.url) {
    return isPathActive(pathname, menu.url)
  }
  return !!menu.items?.some(item => isPathActive(pathname, item.url))
}

/**
 * 路径激活判断:支持前缀匹配,使详情子页(如 /neighborhood/special/[code]/article)
 * 也能激活其父级菜单(/neighborhood/special)。
 *
 * 匹配规则:pathname === url,或 pathname 以 `url + '/'` 开头。
 * 用 `url + '/'` 而非裸 `url` 前缀,避免 /neighborhood/activity 误匹配 /neighborhood/activity-cate。
 */
function isPathActive(pathname: string, url?: string): boolean {
  if (!url)
    return false
  return pathname === url || pathname.startsWith(`${url}/`)
}
</script>

<template>
  <UiSidebarGroup v-for="group in navMain" :key="group.title">
    <UiSidebarGroupLabel>{{ group.title }}</UiSidebarGroupLabel>
    <UiSidebarMenu>
      <template v-for="menu in group.items" :key="menu.title">
        <UiSidebarMenuItem v-if="!menu.items">
          <MenuButton
            :is-active="isActive(menu)"
            :tooltip="menu.title"
            :is-external-url="isExternalUrl(menu.url)"
            :menu="menu as NavItem"
          />
        </UiSidebarMenuItem>

        <UiSidebarMenuItem v-else>
          <!-- sidebar expanded -->
          <UiCollapsible
            v-if="state !== 'collapsed' || isMobile"
            as-child :default-open="isCollapsed(menu)"
            class="group/collapsible"
          >
            <UiSidebarMenuItem>
              <UiCollapsibleTrigger as-child>
                <UiSidebarMenuButton :tooltip="menu.title">
                  <component :is="menu.icon" v-if="menu.icon" />
                  <span>{{ menu.title }}</span>
                  <ChevronRightIcon
                    class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                  />
                </UiSidebarMenuButton>
              </UiCollapsibleTrigger>
            </UiSidebarMenuItem>
            <UiCollapsibleContent class="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
              <UiSidebarMenuSub>
                <UiSidebarMenuSubItem v-for="subItem in menu.items" :key="subItem.title">
                  <UiSidebarMenuSubButton as-child :is-active="isActive(subItem as NavItem)">
                    <a v-if="isExternalUrl(subItem?.url)" :href="subItem?.url" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2">
                      <component :is="subItem.icon" v-if="subItem.icon" />
                      <span>{{ subItem.title }}</span>
                      <ExternalLinkIcon class="w-4 h-4 ml-auto" />
                    </a>
                    <router-link v-else :to="subItem?.url || '/'">
                      <component :is="subItem.icon" v-if="subItem.icon" />
                      <span>{{ subItem.title }}</span>
                    </router-link>
                  </UiSidebarMenuSubButton>
                </UiSidebarMenuSubItem>
              </UiSidebarMenuSub>
            </UiCollapsibleContent>
          </UiCollapsible>

          <!-- sidebar collapsed -->
          <UiDropdownMenu v-else>
            <UiDropdownMenuTrigger as-child>
              <UiSidebarMenuButton :tooltip="menu.title">
                <component :is="menu.icon" v-if="menu.icon" />
                <span>{{ menu.title }}</span>
              </UiSidebarMenuButton>
            </UiDropdownMenuTrigger>
            <UiDropdownMenuContent align="start" side="right">
              <UiDropdownMenuLabel>{{ menu.title }}</UiDropdownMenuLabel>
              <UiDropdownMenuSeparator />
              <UiDropdownMenuItem v-for="subItem in menu.items" :key="subItem.title" as-child>
                <MenuButton
                  :is-active="isActive(subItem as NavItem)"
                  :tooltip="subItem.title"
                  :is-external-url="isExternalUrl(subItem?.url)"
                  :menu="subItem as NavItem"
                />
              </UiDropdownMenuItem>
            </UiDropdownMenuContent>
          </UiDropdownMenu>
        </UiSidebarMenuItem>
      </template>
    </UiSidebarMenu>
  </UiSidebarGroup>
</template>
