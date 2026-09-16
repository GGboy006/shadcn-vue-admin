import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

/** 订单支付状态:0免费 / 1已支付 / 2未支付 / 4已退款(对接文档 §7) */
export type CommunityMemberOrderPayStatus = 0 | 1 | 2 | 4

/** 订单状态:1待支付/进行中 / 2已完成 / 3已取消 */
export type CommunityMemberOrderStatus = 1 | 2 | 3

/** 支付方式:1微信App / 3微信H5 / 5支付宝 */
export type CommunityMemberPayWay = 1 | 3 | 5

/** 支付平台:1百度小程序 / 2微信小程序 / 3、4 App / 5 H5 */
export type CommunityMemberPayPlatform = 1 | 2 | 3 | 4 | 5

export const communityMemberOrderPayStatusConfig: Record<CommunityMemberOrderPayStatus, { label: string, variant: 'secondary' | 'success' | 'warning' | 'destructive' }> = {
  0: { label: '免费', variant: 'secondary' },
  1: { label: '已支付', variant: 'success' },
  2: { label: '未支付', variant: 'warning' },
  4: { label: '已退款', variant: 'destructive' },
}

export const communityMemberOrderStatusConfig: Record<CommunityMemberOrderStatus, { label: string, variant: 'warning' | 'success' | 'secondary' }> = {
  1: { label: '待支付/进行中', variant: 'warning' },
  2: { label: '已完成', variant: 'success' },
  3: { label: '已取消', variant: 'secondary' },
}

export const communityMemberPayWayLabel: Record<CommunityMemberPayWay, string> = {
  1: '微信App',
  3: '微信H5',
  5: '支付宝',
}

export const communityMemberPayPlatformLabel: Record<CommunityMemberPayPlatform, string> = {
  1: '百度小程序',
  2: '微信小程序',
  3: 'App',
  4: 'App',
  5: 'H5',
}

export const memberOrderPayStatusFilterOptions: { value: CommunityMemberOrderPayStatus, label: string }[] = [
  { value: 0, label: '免费' },
  { value: 1, label: '已支付' },
  { value: 2, label: '未支付' },
  { value: 4, label: '已退款' },
]

export const memberOrderStatusFilterOptions: { value: CommunityMemberOrderStatus, label: string }[] = [
  { value: 1, label: '待支付/进行中' },
  { value: 2, label: '已完成' },
  { value: 3, label: '已取消' },
]

/** 订单分页查询(对接文档 §6.1) */
export interface ICommunityMemberOrderPageQuery extends IPageParam {
  /** 手机号 / 姓名 / 商户订单号 / 用户标识 */
  keyword?: string
  payStatus?: CommunityMemberOrderPayStatus
  status?: CommunityMemberOrderStatus
}

/** 订单 VO(对接文档 §6.3,不回显 payObj) */
export interface ICommunityMemberOrder {
  id?: string
  uniqueCode: string
  /** 商户订单号 */
  orderid?: string
  /** 套餐 uniqueCode */
  priceCode?: string
  priceName?: string
  price?: number
  effectiveDays?: number
  /** 支付成功后才有 */
  startTime?: string
  endTime?: string
  tradeCode?: string
  payWay?: CommunityMemberPayWay
  payPlatform?: CommunityMemberPayPlatform
  payStatus?: CommunityMemberOrderPayStatus
  payTime?: string
  userUniqueCode?: string
  phone?: string
  userName?: string
  regionCode?: string
  businessCode?: string
  partnerId?: string
  remark?: string
  status?: CommunityMemberOrderStatus
  createTime?: string
  updateTime?: string
}

export type ICommunityMemberOrderPageResponse = IResponse<IPageResult<ICommunityMemberOrder>>
export type ICommunityMemberOrderDetailResponse = IResponse<ICommunityMemberOrder>

export function normalizeMemberOrder(raw: ICommunityMemberOrder): ICommunityMemberOrder {
  return {
    ...raw,
    uniqueCode: String(raw.uniqueCode),
    id: raw.id == null ? undefined : String(raw.id),
  }
}

export function memberOrderPayStatusText(payStatus?: CommunityMemberOrderPayStatus) {
  if (payStatus == null)
    return '-'
  return communityMemberOrderPayStatusConfig[payStatus]?.label ?? String(payStatus)
}

export function memberOrderStatusText(status?: CommunityMemberOrderStatus) {
  if (status == null)
    return '-'
  return communityMemberOrderStatusConfig[status]?.label ?? String(status)
}

export function memberOrderPayWayText(payWay?: CommunityMemberPayWay) {
  if (payWay == null)
    return undefined
  return communityMemberPayWayLabel[payWay]
}

export function memberOrderPayPlatformText(payPlatform?: CommunityMemberPayPlatform) {
  if (payPlatform == null)
    return undefined
  return communityMemberPayPlatformLabel[payPlatform]
}
