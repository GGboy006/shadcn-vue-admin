import { defineStore } from 'pinia'

import type { ContentLayout, Radius } from '@/constants/themes'

export const useThemeStore = defineStore('system-config', () => {
  const radius = ref(0.5)
  function setRadius(newRadius: Radius) {
    radius.value = newRadius
  }

  const contentLayout = ref<ContentLayout>('centered')
  function setContentLayout(newContentLayout: ContentLayout) {
    contentLayout.value = newContentLayout
  }
  return {
    radius,
    setRadius,

    contentLayout,
    setContentLayout,
  }
}, {
  persist: true,
})
