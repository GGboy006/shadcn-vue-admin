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
  /** 管家服务(本馆账号) */
  housekeeper = 9,
}

/** 商户后台用户类型:商户/居委会。物业是外部产品,不进本后台 */
export const MERCHANT_BUSINESS_USER_TYPES: readonly number[] = [
  UserType.merchant,
  UserType.committee,
] as const

/** 物业账号不可登录本后台时的提示 */
export const PROPERTY_ACCESS_DENIED = '物业为外部系统，请使用物业产品登录。本后台不支持物业账号。'

/** 是否为商户后台用户类型(商户/居委会) */
export function isMerchantBusinessUser(userType: number | undefined | null): boolean {
  return userType !== undefined && userType !== null && MERCHANT_BUSINESS_USER_TYPES.includes(userType)
}

/** 是否为物业账号(userType=5) */
export function isPropertyUser(userType: number | undefined | null): boolean {
  return userType === UserType.property
}

/** 是否为管家服务账号(userType=9) */
export function isHousekeeperUser(userType: number | undefined | null): boolean {
  return userType === UserType.housekeeper
}

/** 登录后的首页。商户仍进经营概览；站长进数据看板；管家进本馆资料 */
export function homePathForUser(userType: number | undefined | null): string {
  if (userType === UserType.committee)
    return '/neighborhood/home'
  if (userType === UserType.housekeeper)
    return '/housekeeper/profile'
  if (isMerchantBusinessUser(userType))
    return '/merchant-business/overview'
  return '/dashboard'
}
