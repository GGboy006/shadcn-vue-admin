import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

import { normalizeHousekeeperOrderPage } from './housekeeper-order.page'

/** 订单状态(对接文档 §9 / §11) */
export type HousekeeperOrderStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** 订单支付状态(对接文档 §9,与流水 payStatus 不是同一套) */
export type HousekeeperOrderPayStatus = 0 | 1 | 2 | 3 | 4

/** 分配模式:1 到人指定 / 2 整馆派单 */
export type HousekeeperAssignMode = 1 | 2

/** 支付渠道:1 微信 / 2 支付宝 */
export type HousekeeperPayChannel = 1 | 2

/** 支付流水状态(对接文档 §11,与订单 payStatus 不同) */
export type HousekeeperPaymentPayStatus = 0 | 1 | 2 | 3 | 4 | 5

/** 支付场景:1 订单预付 / 2 履约尾款 / 3 履约进度款 */
export type HousekeeperPaymentScene = 1 | 2 | 3

/** 评价人:1 居民评师傅 / 2 师傅评居民 */
export type HousekeeperEvaluatorType = 1 | 2

/** 操作人:1 居民 / 2 商户(师傅) / 3 站长 / 4 系统 */
export type HousekeeperOperatorType = 1 | 2 | 3 | 4

/** 取消方:1 居民 / 2 商户 / 3 系统或站长 */
export type HousekeeperCancelBy = 1 | 2 | 3

/** 本站订单分页查询(对接文档 §4.1,`GET /housekeeper/order/page`) */
export interface IHousekeeperOrderPageQuery extends IPageParam {
  /** 订单状态 */
  orderStatus?: HousekeeperOrderStatus
  /** 订单支付状态 */
  payStatus?: HousekeeperOrderPayStatus
  /** 管家服务 ID */
  housekeeperId?: string
  /** 服务人员 ID */
  staffId?: string
  /** 服务分类 ID */
  categoryId?: string
  /** 匹配订单号 / 联系人 / 手机 / 服务名 / 师傅名 */
  keyword?: string
  /** 下单时间起,`yyyy-MM-dd HH:mm:ss` */
  createTimeBegin?: string
  /** 下单时间止,`yyyy-MM-dd HH:mm:ss` */
  createTimeEnd?: string
}

/** 列表 VO(对接文档 §4.2 HousekeeperOrderListVO);雪花 ID 按站长仓惯例用 string */
export interface IHousekeeperOrder {
  /** 订单 ID,详情/取消/改派用 */
  orderId: string
  /** 订单编号 */
  orderNo: string
  /** 服务展示名 */
  itemName?: string
  /** 分类名 */
  categoryName?: string
  /** 管家馆 ID */
  housekeeperId?: string
  /** 管家馆名称 */
  housekeeperName?: string
  /** 师傅 ID;整馆待抢时可能为空 */
  staffId?: string
  /** 师傅姓名 */
  staffName?: string
  /** 分配模式:1 到人指定 / 2 整馆派单 */
  assignMode?: HousekeeperAssignMode
  /** 下单居民昵称 */
  residentNickname?: string
  /** 下单居民手机 */
  residentPhone?: string
  /** 上门联系人 */
  contactName?: string | null
  /** 上门联系手机 */
  contactPhone?: string | null
  /** 服务地址 */
  serviceAddress?: string
  /** 预约时间 */
  appointmentTime?: string
  /** 订单金额(元) */
  totalAmount?: number
  /** 实付金额(未支付时后端可能返回 null) */
  payAmount?: number | null
  /** 订单支付状态 */
  payStatus?: HousekeeperOrderPayStatus
  /** 支付状态文案,列表直接展示 */
  payStatusLabel?: string
  /** 订单状态 */
  orderStatus: HousekeeperOrderStatus
  /** 订单状态文案,列表直接展示 */
  orderStatusLabel?: string
  /** 履约方:`LOCAL` 本站,其它为第三方编码 */
  fulfillProviderCode?: string
  /** 下单时的支付方式:1 线上 / 2 线下。空=第三方或历史单 */
  payMode?: 1 | 2 | null
  /** 下单时间 */
  createTime?: string
}

/** 支付流水(对接文档 §5.2) */
export interface IHousekeeperOrderPayment {
  paymentId: string
  paymentNo?: string
  paymentScene?: HousekeeperPaymentScene
  channel?: HousekeeperPayChannel
  amount?: number
  payStatus?: HousekeeperPaymentPayStatus
  payStatusLabel?: string
  thirdTradeNo?: string
  payTime?: string
  closeTime?: string
  refundAmount?: number
  refundTime?: string
  createTime?: string
}

/** 评价(对接文档 §5.3) */
export interface IHousekeeperOrderEvaluation {
  evaluationId: string
  evaluatorType?: HousekeeperEvaluatorType
  evaluatorName?: string
  score?: number
  serviceAttitudeScore?: number
  serviceQualityScore?: number
  serviceSpeedScore?: number
  content?: string
  images?: string[]
  isAnonymous?: number
  createTime?: string
}

/** 状态日志(对接文档 §5.4) */
export interface IHousekeeperOrderStatusLog {
  logId: string
  fromStatus?: HousekeeperOrderStatus | null
  toStatus?: HousekeeperOrderStatus
  operatorName?: string
  operatorType?: HousekeeperOperatorType
  remark?: string
  createTime?: string
}

/** 详情 VO(对接文档 §5.1,列表字段 + 扩展) */
export interface IHousekeeperOrderDetail extends IHousekeeperOrder {
  residentId?: string
  residentUserId?: string
  categoryId?: string
  serviceDesc?: string
  serviceImages?: string[]
  unitPrice?: number
  quantity?: number
  unit?: string
  actualAmount?: number
  payChannel?: HousekeeperPayChannel
  payTime?: string
  acceptTime?: string
  serviceStartTime?: string
  serviceEndTime?: string
  confirmTime?: string
  cancelTime?: string
  cancelReason?: string
  cancelBy?: HousekeeperCancelBy
  servicePersonPhone?: string
  remark?: string
  payments?: IHousekeeperOrderPayment[]
  evaluations?: IHousekeeperOrderEvaluation[]
  statusLogs?: IHousekeeperOrderStatusLog[]
}

/** 站长取消请求体(对接文档 §6.1,可空) */
export interface IHousekeeperOrderCancelDTO {
  cancelReason?: string
}

/** 改派请求体(对接文档 §7.1) */
export interface IHousekeeperOrderReassignDTO {
  staffId: string
  appointmentTime?: string
  remark?: string
}

export type IHousekeeperOrderPageResponse = IResponse<IPageResult<IHousekeeperOrder>>
export type IHousekeeperOrderDetailResponse = IResponse<IHousekeeperOrderDetail>

/** 本站订单分页(对接文档 §4,`GET /housekeeper/order/page`) */
export function useGetHousekeeperOrderPageQuery(query: Ref<IHousekeeperOrderPageQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IHousekeeperOrderPageResponse, Error>({
    queryKey: ['housekeeperOrderList', query],
    queryFn: async () => {
      const res = await apiFetch<IHousekeeperOrderPageResponse>('/housekeeper/order/page', {
        method: 'get',
        query: query.value,
      })
      return {
        ...res,
        data: normalizeHousekeeperOrderPage(res.data),
      }
    },
    retry: false,
  })
}

/** 订单详情(对接文档 §5,`GET /housekeeper/order/{orderId}`) */
export function useGetHousekeeperOrderDetailQuery(orderId: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IHousekeeperOrderDetailResponse, Error>({
    queryKey: ['housekeeperOrderDetail', orderId],
    queryFn: async () => {
      return await apiFetch<IHousekeeperOrderDetailResponse>(`/housekeeper/order/${orderId.value}`)
    },
    enabled: () => (enabled?.value ?? true) && orderId.value !== undefined,
    retry: false,
  })
}

/** 站长取消(对接文档 §6,`PUT /housekeeper/order/{orderId}/cancel`) */
export function useCancelHousekeeperOrderMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, { orderId: string } & IHousekeeperOrderCancelDTO>({
    mutationKey: ['cancelHousekeeperOrder'],
    mutationFn: async ({ orderId, cancelReason }) => {
      const trimmed = cancelReason?.trim()
      return await apiFetch<IResponse<boolean>>(`/housekeeper/order/${orderId}/cancel`, {
        method: 'put',
        body: trimmed ? { cancelReason: trimmed } : {},
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeperOrderList'] })
      queryClient.invalidateQueries({ queryKey: ['housekeeperOrderDetail'] })
    },
  })
}

/** 改派师傅(对接文档 §7,`PUT /housekeeper/order/{orderId}/reassign`) */
export function useReassignHousekeeperOrderMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, { orderId: string } & IHousekeeperOrderReassignDTO>({
    mutationKey: ['reassignHousekeeperOrder'],
    mutationFn: async ({ orderId, staffId, appointmentTime, remark }) => {
      const body: IHousekeeperOrderReassignDTO = { staffId }
      const trimmedRemark = remark?.trim()
      if (appointmentTime)
        body.appointmentTime = appointmentTime
      if (trimmedRemark)
        body.remark = trimmedRemark
      return await apiFetch<IResponse<boolean>>(`/housekeeper/order/${orderId}/reassign`, {
        method: 'put',
        body,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeperOrderList'] })
      queryClient.invalidateQueries({ queryKey: ['housekeeperOrderDetail'] })
    },
  })
}
