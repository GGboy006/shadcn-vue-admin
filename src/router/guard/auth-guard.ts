import type { Router } from 'vue-router'

import { storeToRefs } from 'pinia'

import { homePathForUser, isPropertyUser, UserType } from '@/constants/user-type'
import pinia from '@/plugins/pinia/setup'
import { ensureHousekeeperKind, housekeeperKind } from '@/services/api/housekeeper-partner.access'
import { useAuthStore } from '@/stores/auth'
import { useUserInfoStore } from '@/stores/user-info'

import { isPublicPath, MARKETING_HOME } from './public-path'

export { isPublicPath, MARKETING_HOME }

export function setupAuthGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const authStore = useAuthStore(pinia)
    const { isLogin } = storeToRefs(authStore)

    const isAuthPage = to.path.startsWith('/auth')
    const isFromAuthPage = from.path.startsWith('/auth')

    const userType = authStore.userInfo?.userType

    // 物业是外部产品:已有会话也清掉,避免旧 token 继续进后台
    if (isLogin.value && isPropertyUser(userType)) {
      authStore.clearAuth()
      useUserInfoStore(pinia).clearUserInfo()
      if (!isAuthPage && !isPublicPath(to.path))
        return { path: '/auth/sign-in' }
    }

    // 已登录用户访问登录页 -> 重定向到首页或之前页面
    if (isLogin.value && isAuthPage) {
      if (from.path && from.path !== to.path && !isFromAuthPage) {
        return from
      }
      // 居委会、管家各自回自己的首页；站长和商户仍回数据看板
      if (userType === UserType.housekeeper)
        await ensureHousekeeperKind(authStore.token)
      if (userType === UserType.committee || userType === UserType.housekeeper)
        return { path: homePathForUser(userType, housekeeperKind().value) }
      return { path: '/dashboard' }
    }

    // 未登录访问根路径 -> 官网
    if (!isLogin.value && (to.path === '/' || to.path === ''))
      return { path: MARKETING_HOME }

    // 未登录用户访问非公开页面 -> 重定向到登录页
    if (!isLogin.value && !isPublicPath(to.path)) {
      return {
        path: '/auth/sign-in',
        query: { redirect: to.fullPath },
      }
    }

    // 角色权限判断：页面需要特定角色，但用户没有
    const requiredRoles = to.meta.roles as number[] | undefined
    if (requiredRoles && (!userType || !requiredRoles.includes(userType))) {
      return { path: '/errors/403' }
    }

    if (userType === UserType.housekeeper && to.path.startsWith('/housekeeper')) {
      await ensureHousekeeperKind(authStore.token)
      if (housekeeperKind().value === 'partner' && to.path.startsWith('/housekeeper/profile'))
        return { path: '/housekeeper/staff' }
    }
  })
}
