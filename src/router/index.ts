import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router'
import { handleHotUpdate, routes } from 'vue-router/auto-routes'

import env from '@/utils/env'

import { setupRouterGuard } from './guard'

const router = createRouter({
  history: createWebHistory(env.VITE_BASE_URL),
  routes: setupLayouts(routes),

  scrollBehavior() {
    return { left: 0, top: 0, behavior: 'smooth' }
  },
})

setupRouterGuard(router)

export default router

if (import.meta.hot) {
  handleHotUpdate(router)
}
