import { storeToRefs } from 'pinia'
import { watch } from 'vue'

import { useThemeStore } from '@/stores/theme'

export function useSystemTheme() {
  const themeStore = useThemeStore()
  const { setRadius } = themeStore
  const { radius } = storeToRefs(themeStore)

  if (typeof document !== 'undefined') {
    watch(radius, (radius) => {
      document.documentElement.style.setProperty('--radius', `${radius}rem`)
    }, { immediate: true })
  }

  return {
    radius,
    setRadius,
  }
}
