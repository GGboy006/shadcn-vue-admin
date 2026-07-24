import type { Router } from 'vue-router'

import { setupAuthGuard } from './auth-guard'
import { setupCommonGuard } from './common-guard'
import { setupMerchantBusinessGuard } from './merchant-business-guard'

export function setupRouterGuard(router: Router) {
  setupCommonGuard(router)
  setupAuthGuard(router)
  // 商户后台守卫需在 auth-guard 之后:依赖登录态与 userType 已就绪
  setupMerchantBusinessGuard(router)
}
