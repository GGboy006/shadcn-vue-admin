import { useMerchantBusinessStore } from '@/stores/merchant-business'

/**
 * 进入商户后台(站长代客)的统一入口。
 *
 * 行为:写入代客 store(merchantId + merchantName)-> 跳转 /merchant-business?mId=xxx。
 * 商户列表「进入商户后台」按钮 与 名称列点击 复用此逻辑,避免重复实现。
 *
 * 路由守卫(merchant-business-guard)会读取 mId 触发 enterProxy,
 * 这里显式调用以保证 merchantName 立即可用(守卫只拿 mId,拿不到 name)。
 */
export function useEnterMerchantBusiness() {
  const store = useMerchantBusinessStore()
  const router = useRouter()

  function enterMerchantBusiness(merchantId: string, merchantName: string) {
    store.enterProxy(merchantId, merchantName)
    router.push({ path: '/merchant-business', query: { mId: merchantId } })
  }

  return {
    enterMerchantBusiness,
  }
}
