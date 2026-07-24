import { computed } from 'vue'

import { useMerchantBusinessStore } from '@/stores/merchant-business'

/**
 * 统一获取当前操作的 merchantId 与代客模式状态。
 *
 * 商户后台所有接口的路径拼接与 queryKey 都依赖此 composable:
 * - 商户/物业自身:proxyMode=false,merchantId 为自身 ID
 * - 站长代客:proxyMode=true,merchantId/merchantName 由商户列表跳转时带入 store
 */
export function useCurrentMerchantId() {
  const store = useMerchantBusinessStore()

  const merchantId = computed(() => store.merchantId)
  const proxyMode = computed(() => store.proxyMode)
  const merchantName = computed(() => store.merchantName)

  return {
    merchantId,
    proxyMode,
    merchantName,
  }
}
