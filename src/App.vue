<script setup lang="ts">
import Loading from '@/components/loading.vue'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider as UiTooltipProvider } from '@/components/ui/tooltip'
import { useSystemTheme } from '@/composables/use-system-theme'

useSystemTheme()
</script>

<template>
  <Toaster />

  <!-- <Toaster
  position="top-right"
  :duration="3000"         显示时长（毫秒）
  :rich-colors="true"     使用更丰富的颜色
  :close-button="true"    显示关闭按钮
  /> -->

  <UiTooltipProvider :delay-duration="300">
    <Suspense>
      <router-view v-slot="{ Component, route }">
        <component :is="Component" :key="route" />
      </router-view>

      <template #fallback>
        <Loading />
      </template>
    </Suspense>
  </UiTooltipProvider>
</template>
