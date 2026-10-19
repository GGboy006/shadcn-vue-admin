import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router'
import { handleHotUpdate, routes } from 'vue-router/auto-routes'

import env from '@/utils/env'

import { setupRouterGuard } from './guard'

const router = createRouter({
  history: createWebHistory(env.VITE_BASE_URL),
  routes: setupLayouts(routes),

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition)
      return savedPosition
    // 同一页只改 query（选机构、切页签）时不要把窗口拉回顶部
    if (to.path === from.path)
      return false
    return { left: 0, top: 0, behavior: 'smooth' }
  },
})

setupRouterGuard(router)

export default router

if (import.meta.hot) {
  handleHotUpdate(router)
}
