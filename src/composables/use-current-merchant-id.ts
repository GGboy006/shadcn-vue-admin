import { computed } from 'vue'

import { useUserInfoStore } from '@/stores/user-info'
import { isProxyTab } from '@/utils/proxy-auth'

/**
 * 统一获取当前操作的 merchantId / merchantName / 代客标记。
 *
 * 商户后台所有接口的路径拼接与 queryKey 都依赖此 composable。
 * 新方案下两种身份统一从 userInfoStore.merchantInfo 取:
 * - 商户/居委会自身:登录后 myMerchantInfo 写入 merchantInfo
 * - 站长代客标签页:换 token 后 consume 写入 merchantInfo(代客标签页 sessionStorage)
 *
 * proxyMode 字段保留以兼容消费方(如 overview),语义改为"是否代客标签页"(isProxyTab)。
 */
export function useCurrentMerchantId() {
  const userInfoStore = useUserInfoStore()

  const merchantId = computed(() => userInfoStore.merchantInfo?.merchantId ?? '')
  const merchantName = computed(() => userInfoStore.merchantInfo?.merchantName ?? '')
  const proxyMode = computed(() => isProxyTab())

  return {
    merchantId,
    proxyMode,
    merchantName,
  }
}
