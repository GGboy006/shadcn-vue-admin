import { useQuery } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IResponse } from '../types/response.type'

/**
 * 三端工作台汇总接口(对接文档 doc/三端工作台字段描述.md)。
 *
 * 三端均已上线真实接口,身份参数(partnerId/merchantCode/orgCode)由后端从
 * 登录 token 解析,前端调用时请求体传 {} 即可,无需手动传参。
 */

// ==================== 站长工作台 ====================

/** 商户收入排行单条 */
export interface IStationIncomeRankItem {
  merchantCode: string
  merchantName: string
  totalAmount: number
  orderCount: number
}

/** 近 7 日订单趋势单日数据点(站长/商户共用结构) */
export interface IStationOrderTrendPoint {
  /** 星期几,如"周一" */
  day: string
  /** 本周订单量 */
  thisWeek: number
  /** 上周同期订单量,用于环比对照 */
  lastWeek: number
}

/**
 * 签约构成单条(按签约方类型拆分)。
 *
 * 站长概览页更关注"签约"而非商户订单收入:站长的签约对象不止商户,还包括
 * 居委会、物业等,所以这里按类型(商户/居委会/物业)拆分数量与金额,而不是
 * 简单给一个笼统的 totalSignFee。
 */
export interface IStationSignItem {
  /** 类型 key,如 merchant / org / property */
  type: string
  /** 展示名称,如 商户 / 居委会 / 物业 */
  typeName: string
  /** 该类型启用签约数(status=1) */
  count: number
  /** 该类型签约费合计(signFee) */
  amount: number
}

/**
 * 居委会明细单条(签约金额 + 留言待处理)。
 *
 * 注意:多个居委会时 leaveMessagePending 目前还没按 orgCode 拆分,后端暂返回 0;
 * 仅名下 1 个居委会时会直接回填 leaveMessagePendingCount 汇总值。
 */
export interface IStationOrgItem {
  orgCode: string
  orgName: string
  /** 该居委会签约金额 */
  signAmount: number
  /** 该居委会留言待处理数 */
  leaveMessagePending: number
}

/** 近 N 月新签约趋势单月数据点 */
export interface IStationSignTrendPoint {
  /** 月份,如"3月" */
  month: string
  /** 当月新增商户签约数 */
  merchant: number
  /** 当月新增居委会签约数 */
  org: number
  /** 当月新增物业签约数 */
  property: number
}

/** 站长工作台汇总响应(StationWorkbenchSummaryVO) */
export interface IStationWorkbenchVO {
  totalOrderAmount: number
  incomeAnalysis: IStationIncomeRankItem[]
  merchantGoodsCount: number
  merchantFaqCount: number
  merchantActivityCount: number
  noticeCount: number
  dynamicPendingCount: number
  servicePendingCount: number
  communityGoodsPendingCount: number
  secondhandPendingCount: number
  leaveMessagePendingCount: number
  /** 按商户/居委会/物业拆分的签约数量与金额 */
  signAnalysis: IStationSignItem[]
  /** 近 6 个月新签约趋势,按类型拆分 */
  signTrend: IStationSignTrendPoint[]
  /** 名下居委会明细(签约金额+留言待处理排行) */
  orgAnalysis: IStationOrgItem[]
  feedbackPendingCount: number
  /** 商户端 AI 对话次数(近 30 天),放在「商户」Tab */
  merchantAiConversationCount: number
  /** 商户端 AI 生图次数(近 30 天),放在「商户」Tab */
  merchantAiImageGenerationCount: number
  /** 居民端 AI 对话次数(近 30 天,对应侧边栏"居民AI工具"),放在「小区服务」Tab */
  residentAiConversationCount: number
  /** 居民端 AI 生图次数(近 30 天),放在「小区服务」Tab */
  residentAiImageGenerationCount: number
  /** 近 7 日订单量趋势(本周 vs 上周同期),后端按天拆分暂未就绪时返回 [] */
  orderTrend: IStationOrderTrendPoint[]
}

export type IStationWorkbenchResponse = IResponse<IStationWorkbenchVO>

/**
 * 站长工作台汇总(POST /workBench/station)。
 *
 * 后端按 token 识别当前站长身份,无需手动传参。可选传 startTime/endTime
 * (格式 yyyy-MM-dd HH:mm:ss)缩小订单统计区间,默认近 30 天,当前页面未提供
 * 时间筛选,直接传空 body。
 */
export function useStationWorkbenchQuery() {
  const { apiFetch } = useApiFetch()

  return useQuery<IStationWorkbenchResponse, Error>({
    queryKey: ['workbench', 'station', 'summary'],
    queryFn: async () => await apiFetch<IStationWorkbenchResponse>('/workBench/station', {
      method: 'post',
      body: {},
    }),
    staleTime: 60_000,
  })
}

// ==================== 商户工作台 ====================

/** 近 7 日订单趋势单日数据点(结构同站长端) */
export interface IMerchantOrderTrendPoint {
  /** 星期几,如"周一" */
  day: string
  /** 本周订单量 */
  thisWeek: number
  /** 上周同期订单量,用于环比对照 */
  lastWeek: number
}

/** 商户/物业工作台汇总响应(MerchantWorkbenchSummaryVO,物业与商户同一接口、同一套字段) */
export interface IMerchantWorkbenchVO {
  todayOrderCount: number
  todayAmount: number
  last7OrderCount: number
  last7Amount: number
  pendingPayCount: number
  refundCount: number
  onSaleCount: number
  offSaleCount: number
  activeActivityCount: number
  expiringActivityCount: number
  faqCount: number
  categoryReady: boolean
  /** 近 7 日订单量趋势(本周 vs 上周同期),后端按天拆分暂未就绪时返回 [] */
  orderTrend: IMerchantOrderTrendPoint[]
  housekeepingOrderCount: number
  /** 智采订单数(近 30 天),后端暂无独立智采订单表,当前恒为 0 */
  procurementOrderCount: number
  digitalEmployeeCount: number
  conversationCount: number
}

export type IMerchantWorkbenchResponse = IResponse<IMerchantWorkbenchVO>

/**
 * 商户/物业工作台汇总(POST /workBench/merchant)。
 *
 * 商户/物业自身调用时后端按 token 识别身份,无需传参;站长代客标签页会先换成
 * 该商户范围的 token(见 useCurrentMerchantId),同样不需要额外传 merchantId。
 */
export function useMerchantWorkbenchQuery() {
  const { apiFetch } = useApiFetch()

  return useQuery<IMerchantWorkbenchResponse, Error>({
    queryKey: ['workbench', 'merchant', 'summary'],
    queryFn: async () => await apiFetch<IMerchantWorkbenchResponse>('/workBench/merchant', {
      method: 'post',
      body: {},
    }),
    staleTime: 60_000,
  })
}

// ==================== 居委会工作台 ====================

/** 居委会工作台汇总响应(OrgWorkbenchSummaryVO) */
export interface IOrgWorkbenchVO {
  noticePendingCount: number
  noticePublishedCount: number
  activityPendingCount: number
  activityPublishedCount: number
  dynamicPendingCount: number
  dynamicPublishedCount: number
  specialPendingCount: number
  specialPublishedCount: number
  bannerPendingCount: number
  bannerPublishedCount: number
  leaveMessagePending: number
  leaveMessageReplied: number
  leaveMessageTotal: number
  hotlineCount: number
  serviceCount: number
  ongoingActivityCount: number
  upcomingActivityCount: number
  expiringActivityCount: number
  recommendActivityCount: number
  /** 意见反馈待处理数(所属站长维度) */
  feedbackPendingCount: number
  /** 知识服务阅读量(累计 viewCount) */
  knowledgeReadCount: number
  /** AI 对话次数(近 30 天) */
  aiConversationCount: number
}

export type IOrgWorkbenchResponse = IResponse<IOrgWorkbenchVO>

/** 居委会工作台汇总(POST /workBench/neighborhood),后端按 token 识别当前居委会身份,无需手动传参 */
export function useOrgWorkbenchQuery() {
  const { apiFetch } = useApiFetch()

  return useQuery<IOrgWorkbenchResponse, Error>({
    queryKey: ['workbench', 'org', 'summary'],
    queryFn: async () => await apiFetch<IOrgWorkbenchResponse>('/workBench/neighborhood', {
      method: 'post',
      body: {},
    }),
    staleTime: 60_000,
  })
}
