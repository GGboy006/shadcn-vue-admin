<script setup lang="ts">
import { useCookies } from '@vueuse/integrations/useCookies'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

import AppSidebar from '@/components/app-sidebar/index.vue'
import CommandMenuPanel from '@/components/command-menu-panel/index.vue'
import ThemePopover from '@/components/custom-theme/theme-popover.vue'
import ProxyBanner from '@/components/merchant-business/proxy-banner.vue'
import ToggleTheme from '@/components/toggle-theme.vue'
import { SIDEBAR_COOKIE_NAME } from '@/components/ui/sidebar/utils'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/stores/theme'

const defaultOpen = useCookies([SIDEBAR_COOKIE_NAME])
const themeStore = useThemeStore()
const { contentLayout } = storeToRefs(themeStore)
const route = useRoute()

const isFixedLayout = computed(() => route.meta.layout === 'fixed')
</script>

<template>
  <UiSidebarProvider :default-open="defaultOpen.get(SIDEBAR_COOKIE_NAME)">
    <AppSidebar />
    <UiSidebarInset
      :class="cn(
        'w-full max-w-full',
        isFixedLayout && 'h-screen flex flex-col',
        'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)] peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
      )"
    >
      <header
        class="flex items-center gap-3 sm:gap-4 h-16 p-4 shrink-0 transition-[width,height] ease-linear"
      >
        <UiSidebarTrigger class="-ml-1" />
        <UiSeparator orientation="vertical" class="h-6" />
        <CommandMenuPanel />
        <div class="flex-1" />
        <div class="ml-auto flex items-center space-x-4">
          <ToggleTheme />
          <ThemePopover />
        </div>
      </header>

      <ProxyBanner />

      <main
        :class="cn(
          'p-4',
          isFixedLayout ? 'flex-1 overflow-hidden' : 'grow',
          contentLayout === 'centered' ? 'container mx-auto ' : '',
        )"
      >
        <router-view v-slot="{ Component }">
          <component :is="Component" :key="route.meta.reuseOnQuery ? route.path : route.fullPath" />
        </router-view>
      </main>
    </UiSidebarInset>
  </UiSidebarProvider>
</template>
