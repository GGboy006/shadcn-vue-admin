import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

import { stringifyMemberId } from './community-member.page'

/** 支付状态:0待支付 / 1已支付 / 2已取消 / 3已退款 */
export type CommunityMemberOrderPayStatus = 0 | 1 | 2 | 3

/** 订单状态:1进行中 / 2已完成 / 3已取消 */
export type CommunityMemberOrderStatus = 1 | 2 | 3

/** 支付方式:0免费 / 1微信 / 2支付宝 / 3 iOS 内购 */
export type CommunityMemberPayWay = 0 | 1 | 2 | 3

export const communityMemberOrderPayStatusConfig: Record<CommunityMemberOrderPayStatus, { label: string, variant: 'warning' | 'success' | 'secondary' | 'destructive' }> = {
  0: { label: '待支付', variant: 'warning' },
  1: { label: '已支付', variant: 'success' },
  2: { label: '已取消', variant: 'secondary' },
  3: { label: '已退款', variant: 'destructive' },
}

export const communityMemberOrderStatusConfig: Record<CommunityMemberOrderStatus, { label: string, variant: 'warning' | 'success' | 'secondary' }> = {
  1: { label: '进行中', variant: 'warning' },
  2: { label: '已完成', variant: 'success' },
  3: { label: '已取消', variant: 'secondary' },
}

export const communityMemberPayWayLabel: Record<CommunityMemberPayWay, string> = {
  0: '免费',
  1: '微信',
  2: '支付宝',
  3: 'iOS 内购',
}

export const memberOrderPayStatusFilterOptions: { value: CommunityMemberOrderPayStatus, label: string }[] = [
  { value: 0, label: '待支付' },
  { value: 1, label: '已支付' },
  { value: 2, label: '已取消' },
  { value: 3, label: '已退款' },
]

export const memberOrderStatusFilterOptions: { value: CommunityMemberOrderStatus, label: string }[] = [
  { value: 1, label: '进行中' },
  { value: 2, label: '已完成' },
  { value: 3, label: '已取消' },
]

export interface ICommunityMemberOrderPageQuery extends IPageParam {
  /** 模糊搜订单号 / 套餐名称,不搜手机号 */
  keyword?: string
  payStatus?: CommunityMemberOrderPayStatus
  status?: CommunityMemberOrderStatus
}

export interface ICommunityMemberOrder {
  orderId: string
  orderNo?: string
  userId?: string
  stationId?: string
  stationCode?: string
  stationRegionCode?: string
  memberId?: string
  packageId?: string
  packageName?: string
  effectiveDays?: number
  amount?: number
  payAmount?: number
  startTime?: string
  expireTime?: string
  payWay?: CommunityMemberPayWay
  payStatus?: CommunityMemberOrderPayStatus
  payTime?: string
  tradeNo?: string
  status?: CommunityMemberOrderStatus
  remark?: string
  createTime?: string
  updateTime?: string
}

export type ICommunityMemberOrderPageResponse = IResponse<IPageResult<ICommunityMemberOrder>>
export type ICommunityMemberOrderDetailResponse = IResponse<ICommunityMemberOrder>

export function normalizeMemberOrder(raw: ICommunityMemberOrder): ICommunityMemberOrder {
  return {
    ...raw,
    orderId: stringifyMemberId(raw.orderId) ?? '',
    userId: stringifyMemberId(raw.userId),
    stationId: stringifyMemberId(raw.stationId),
    memberId: stringifyMemberId(raw.memberId),
    packageId: stringifyMemberId(raw.packageId),
  }
}

export function canCancelMemberOrder(order: Pick<ICommunityMemberOrder, 'payStatus'>): boolean {
  return order.payStatus === 0
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
