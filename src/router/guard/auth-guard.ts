import type { Router } from 'vue-router'

import { storeToRefs } from 'pinia'

import pinia from '@/plugins/pinia/setup'
import { useAuthStore } from '@/stores/auth'

/** 不需要登录就能访问的页面 */
const WHITE_LIST = ['/auth/sign-in', '/auth/sign-up', '/errors/403', '/errors/404', '/errors/401', '/errors/500', '/errors/503']

export function setupAuthGuard(router: Router) {
  router.beforeEach((to, from) => {
    const authStore = useAuthStore(pinia)
    const { isLogin } = storeToRefs(authStore)

    const isAuthPage = to.path.startsWith('/auth')
    const isFromAuthPage = from.path.startsWith('/auth')
    const isWhiteList = WHITE_LIST.includes(to.path)

    // 已登录用户访问登录页 → 重定向到首页或之前页面
    if (isLogin.value && isAuthPage) {
      if (from.path && from.path !== to.path && !isFromAuthPage) {
        return from
      }
      return { path: '/dashboard' }
    }

    // 未登录用户访问非白名单页面 → 重定向到登录页
    if (!isLogin.value && !isAuthPage && !isWhiteList) {
      return {
        path: '/auth/sign-in',
        query: { redirect: to.fullPath },
      }
    }
  })
}
