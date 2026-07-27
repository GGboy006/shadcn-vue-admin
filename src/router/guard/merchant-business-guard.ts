import type { RouteLocationNormalized, RouteLocationRaw, Router } from 'vue-router'

import { isMerchantBusinessUser } from '@/constants/user-type'
import { useAuthStore } from '@/stores/auth'
import { useUserInfoStore } from '@/stores/user-info'

const MERCHANT_BUSINESS_PREFIX = '/merchant-business'

/**
 * 商户后台路由守卫逻辑:返回重定向目标或 undefined(放行)。
 *
 * 新方案(新标签页换商户 token):
 * - 商户/物业(userType=4/5,含代客标签页,已换商户 token):需有 merchantId,否则 /errors/403
 * - 站长(userType=3)不应直接进商户后台(代客走新标签页,已是商户态)-> 回 /merchants
 * - 未登录/非商户后台路由:交给 auth-guard / 放行
 *
 * 代客标签页的 sessionStorage 在关闭标签页时自动销毁,无需手动 clear。
 */
export function resolveMerchantBusinessRoute(to: RouteLocationNormalized): RouteLocationRaw | undefined {
  const authStore = useAuthStore()
  const userInfoStore = useUserInfoStore()
  const userType = authStore.userInfo?.userType

  // 未登录或身份未知,交给 auth-guard 处理
  if (!authStore.isLogin || userType === undefined)
    return undefined

  if (!to.path.startsWith(MERCHANT_BUSINESS_PREFIX))
    return undefined

  // 商户后台用户(商户/物业/居委会,含代客标签页):需有 merchantId
  if (isMerchantBusinessUser(userType)) {
    if (!userInfoStore.merchantInfo?.merchantId)
      return '/errors/403'
    return undefined
  }

  // 站长或其他身份:不应直接进商户后台,回商户列表
  return '/merchants'
}

/** 注册商户后台路由守卫 */
export function setupMerchantBusinessGuard(router: Router) {
  router.beforeEach((to) => {
    return resolveMerchantBusinessRoute(to)
  })
}
