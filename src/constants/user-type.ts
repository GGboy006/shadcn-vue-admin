/**
 * 用户类型(userType)取值与分组。
 *
 * userType 由后端登录/换 token 接口返回,前端据此决定菜单、路由权限、详情接口。
 * 集中定义避免散落各处的魔法数字与 `=== 4 || === 5 || === 6` 漂移。
 */
export enum UserType {
  /** 站长 */
  stationMaster = 3,
  /** 商户 */
  merchant = 4,
  /** 物业 */
  property = 5,
  /** 居委会 */
  committee = 6,
}

/** 商户后台用户类型:商户/物业/居委会(三者同级,共用商户后台) */
export const MERCHANT_BUSINESS_USER_TYPES: readonly number[] = [
  UserType.merchant,
  UserType.property,
  UserType.committee,
] as const

/** 是否为商户后台用户类型(商户/物业/居委会) */
export function isMerchantBusinessUser(userType: number | undefined | null): boolean {
  return userType !== undefined && userType !== null && MERCHANT_BUSINESS_USER_TYPES.includes(userType)
}
