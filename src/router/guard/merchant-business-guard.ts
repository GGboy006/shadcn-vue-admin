import type { RouteLocationNormalized, RouteLocationRaw, Router } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { useMerchantBusinessStore } from '@/stores/merchant-business'

const MERCHANT_BUSINESS_PREFIX = '/merchant-business'

/**
 * 商户后台路由守卫逻辑:返回重定向目标或 undefined(放行)。
 *
 * 抽出为纯函数(依赖 active pinia 的 store)便于测试;setupMerchantBusinessGuard 注册到 router。
 *
 * 规则(见 doc/merchant-business-dev-plan.md 2.3 与风险 4):
 * - 站长(userType=3)进入 /merchant-business*:
 *   - 已在代客态 -> 放行
 *   - URL 带 mId -> enterProxy(mId, mName?) 后放行
 *   - 无 mId 且非代客 -> 回 /merchants
 * - 商户/物业(userType=4/5)进入 /merchant-business*:initSelf();merchantId 为空 -> /errors/403
 * - 离开 /merchant-business*(站长代客态):自动 clear(),避免菜单错乱
 * - 未登录/身份未知:交给 auth-guard 处理
 */
export function resolveMerchantBusinessRoute(to: RouteLocationNormalized): RouteLocationRaw | undefined {
  const authStore = useAuthStore()
  const store = useMerchantBusinessStore()
  const userType = authStore.userInfo?.userType

  // 未登录或身份未知,交给 auth-guard 处理
  if (!authStore.isLogin || userType === undefined) {
    return undefined
  }

  const isMerchantBusinessRoute = to.path.startsWith(MERCHANT_BUSINESS_PREFIX)

  if (isMerchantBusinessRoute) {
    // 站长代客
    if (userType === 3) {
      if (store.proxyMode) {
        return undefined // 已在代客态,放行
      }
      const mId = to.query.mId as string | undefined
      if (mId) {
        const mName = (to.query.mName as string | undefined) ?? ''
        store.enterProxy(mId, mName)
        return undefined
      }
      // 站长无 mId 且非代客 -> 回商户列表
      return '/merchants'
    }

    // 商户/物业自身
    if (userType === 4 || userType === 5) {
      store.initSelf()
      if (!store.merchantId) {
        return '/errors/403'
      }
      return undefined
    }

    // 其他身份无权访问商户后台
    return '/errors/403'
  }

  // 离开商户后台:站长代客态自动清除,避免菜单错乱(风险 4)
  if (store.proxyMode) {
    store.clear()
  }
  return undefined
}

/** 注册商户后台路由守卫 */
export function setupMerchantBusinessGuard(router: Router) {
  router.beforeEach((to) => {
    return resolveMerchantBusinessRoute(to)
  })
}
