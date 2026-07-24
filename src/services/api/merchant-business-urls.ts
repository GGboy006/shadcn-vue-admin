/**
 * 商户后台 API 的纯函数 builder:URL 路径与 queryKey 约定。
 *
 * 独立成模块,避免 api 文件导入 useApiFetch(连带 pinia setup / localStorage)
 * 污染纯函数测试。merchant-business.api.ts 导入并 re-export。
 */

/** 商户后台模块名 */
export type MerchantModule = 'cate' | 'goods' | 'faq' | 'activity' | 'order'

/**
 * 构建商户后台模块路径前缀:`/merchant/{module}/{merchantId}`
 *
 * 例:merchantModulePath('cate', 'M1') => '/merchant/cate/M1'
 */
export function merchantModulePath(module: MerchantModule, merchantId: string): string {
  return `/merchant/${module}/${merchantId}`
}

/**
 * 商户后台统一 queryKey 前缀:`['merchantBusiness', module, merchantId, ...rest]`
 *
 * merchantId 纳入 key,切换商户自动重新请求。
 */
export function merchantBusinessKey(module: string, merchantId: string, ...rest: unknown[]): unknown[] {
  return ['merchantBusiness', module, merchantId, ...rest]
}
