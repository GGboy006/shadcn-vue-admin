import { useQuery } from '@tanstack/vue-query'

import type { IResponse } from '../types/response.type'

/**
 * 三端工作台汇总接口(对接文档 `doc/CityData工作台汇总接口.md`)。
 *
 * 后端 City Data 接口尚未上线,当前三个 query 均返回本地固定 Mock 数据,
 * 页面结构/字段名已按文档 VO 对齐,后续替换为真实接口时只需把 queryFn
 * 内的 mock 调用换成 `apiFetch('/xxx', { method: 'post', body: ... })`,
 * 组件侧无需改动。
 */

// ==================== 站长工作台 ====================

/** 商户收入排行单条(对接文档 §1 incomeAnalysis) */
export interface IStationIncomeRankItem {
  merchantCode: string
  merchantName: string
  totalAmount: number
  orderCount: number
}

/** City Data 站长汇总(对接文档 §1 StationWorkbenchSummaryVO) */
export interface IStationCityDataVO {
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
}

/** 近 7 日订单趋势单日数据点(City Data 文档未覆盖,需新增接口,见需求清单) */
export interface IStationOrderTrendPoint {
  /** 星期几,如"周一" */
  day: string
  /** 本周订单量 */
  thisWeek: number
  /** 上周同期订单量,用于环比对照 */
  lastWeek: number
}

/**
 * 签约构成单条(按签约方类型拆分,City Data 文档未覆盖,需新增接口,见需求清单)。
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
  /** 签约数量 */
  count: number
  /** 签约金额 */
  amount: number
}

/**
 * 居委会明细单条(City Data 的 `leaveMessagePendingCount` 目前只有跨居委会的汇总值,
 * "居委会"Tab 要按单个居委会展示排行,需要后端把留言待处理数按 orgCode 拆分,
 * 见需求清单。签约金额取自 `signAnalysis` 里 type=org 的那一项,按居委会拆到明细。
 */
export interface IStationOrgItem {
  orgCode: string
  orgName: string
  /** 签约金额 */
  signAmount: number
  /** 留言待处理数 */
  leaveMessagePending: number
}

/** 近 N 月新签约趋势单月数据点(City Data 文档未覆盖,需新增接口,见需求清单) */
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

/** 站长本库统计(City Data 未覆盖:签约构成/签约趋势/居委会明细/反馈/AI/智采/订单趋势) */
export interface IStationLocalStatsVO {
  /** 按商户/居委会/物业拆分的签约数量与金额,后端待新增,当前用 Mock */
  signAnalysis: IStationSignItem[]
  /** 近 6 个月新签约趋势,按类型拆分,后端待新增,当前用 Mock */
  signTrend: IStationSignTrendPoint[]
  /** 名下居委会明细(签约金额+留言待处理排行),后端待新增,当前用 Mock */
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
  /** 近 7 日订单量趋势(本周 vs 上周同期),后端待新增,当前用 Mock */
  orderTrend: IStationOrderTrendPoint[]
}

export interface IStationWorkbenchVO extends IStationCityDataVO, IStationLocalStatsVO {}

export type IStationWorkbenchResponse = IResponse<IStationWorkbenchVO>

const MOCK_STATION_WORKBENCH: IStationWorkbenchVO = {
  totalOrderAmount: 128650.5,
  incomeAnalysis: [
    { merchantCode: 'M1001', merchantName: '幸福便利店', totalAmount: 32680.2, orderCount: 412 },
    { merchantCode: 'M1002', merchantName: '阳光洗衣坊', totalAmount: 21450, orderCount: 268 },
    { merchantCode: 'M1003', merchantName: '暖心家政', totalAmount: 18990.8, orderCount: 156 },
    { merchantCode: 'M1004', merchantName: '邻里生鲜', totalAmount: 15230, orderCount: 301 },
    { merchantCode: 'M1005', merchantName: '快修师傅', totalAmount: 9870.5, orderCount: 88 },
  ],
  merchantGoodsCount: 386,
  merchantFaqCount: 42,
  merchantActivityCount: 15,
  noticeCount: 24,
  dynamicPendingCount: 6,
  servicePendingCount: 3,
  communityGoodsPendingCount: 2,
  secondhandPendingCount: 4,
  leaveMessagePendingCount: 9,
  signAnalysis: [
    { type: 'merchant', typeName: '商户', count: 18, amount: 52000 },
    { type: 'org', typeName: '居委会', count: 5, amount: 18000 },
    { type: 'property', typeName: '物业', count: 6, amount: 16000 },
  ],
  orgAnalysis: [
    { orgCode: 'O2001', orgName: '梧桐苑居委会', signAmount: 4200, leaveMessagePending: 3 },
    { orgCode: 'O2002', orgName: '锦绣花园居委会', signAmount: 3800, leaveMessagePending: 2 },
    { orgCode: 'O2003', orgName: '滨江社区居委会', signAmount: 3600, leaveMessagePending: 1 },
    { orgCode: 'O2004', orgName: '幸福里居委会', signAmount: 3400, leaveMessagePending: 2 },
    { orgCode: 'O2005', orgName: '和风苑居委会', signAmount: 3000, leaveMessagePending: 1 },
  ],
  signTrend: [
    { month: '3月', merchant: 2, org: 1, property: 0 },
    { month: '4月', merchant: 3, org: 0, property: 1 },
    { month: '5月', merchant: 1, org: 1, property: 1 },
    { month: '6月', merchant: 4, org: 0, property: 0 },
    { month: '7月', merchant: 2, org: 1, property: 2 },
    { month: '8月', merchant: 3, org: 0, property: 1 },
  ],
  feedbackPendingCount: 7,
  merchantAiConversationCount: 186,
  merchantAiImageGenerationCount: 24,
  residentAiConversationCount: 59,
  residentAiImageGenerationCount: 14,
  orderTrend: [
    { day: '周一', thisWeek: 42, lastWeek: 35 },
    { day: '周二', thisWeek: 38, lastWeek: 41 },
    { day: '周三', thisWeek: 51, lastWeek: 33 },
    { day: '周四', thisWeek: 46, lastWeek: 48 },
    { day: '周五', thisWeek: 63, lastWeek: 52 },
    { day: '周六', thisWeek: 58, lastWeek: 61 },
    { day: '周日', thisWeek: 49, lastWeek: 44 },
  ],
}

/** 站长工作台汇总(对接 `POST /data/station/workbench/stationSummary`,当前用 Mock) */
export function useStationWorkbenchQuery() {
  return useQuery<IStationWorkbenchResponse, Error>({
    queryKey: ['workbench', 'station', 'summary'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300))
      return { code: 0, msg: 'success', data: MOCK_STATION_WORKBENCH }
    },
    staleTime: 60_000,
  })
}

// ==================== 商户工作台 ====================

/** City Data 商户汇总(对接文档 §2 MerchantWorkbenchSummaryVO) */
export interface IMerchantCityDataVO {
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
}

/** 近 7 日订单趋势单日数据点(结构同站长端,City Data 文档未覆盖,需新增接口) */
export interface IMerchantOrderTrendPoint {
  /** 星期几,如"周一" */
  day: string
  /** 本周订单量 */
  thisWeek: number
  /** 上周同期订单量,用于环比对照 */
  lastWeek: number
}

/** 商户本库统计(City Data 未覆盖:家政/智采/数字员工/对话/订单趋势) */
export interface IMerchantLocalStatsVO {
  housekeepingOrderCount: number
  procurementOrderCount: number
  digitalEmployeeCount: number
  conversationCount: number
  /** 近 7 日订单量趋势(本周 vs 上周同期),后端待新增,当前用 Mock */
  orderTrend: IMerchantOrderTrendPoint[]
}

export interface IMerchantWorkbenchVO extends IMerchantCityDataVO, IMerchantLocalStatsVO {}

export type IMerchantWorkbenchResponse = IResponse<IMerchantWorkbenchVO>

const MOCK_MERCHANT_WORKBENCH: IMerchantWorkbenchVO = {
  todayOrderCount: 23,
  todayAmount: 1860.5,
  last7OrderCount: 156,
  last7Amount: 12680,
  pendingPayCount: 4,
  refundCount: 2,
  onSaleCount: 68,
  offSaleCount: 9,
  activeActivityCount: 3,
  expiringActivityCount: 1,
  faqCount: 12,
  categoryReady: true,
  housekeepingOrderCount: 8,
  procurementOrderCount: 5,
  digitalEmployeeCount: 2,
  conversationCount: 34,
  orderTrend: [
    { day: '周一', thisWeek: 5, lastWeek: 4 },
    { day: '周二', thisWeek: 3, lastWeek: 6 },
    { day: '周三', thisWeek: 7, lastWeek: 5 },
    { day: '周四', thisWeek: 4, lastWeek: 3 },
    { day: '周五', thisWeek: 8, lastWeek: 7 },
    { day: '周六', thisWeek: 9, lastWeek: 8 },
    { day: '周日', thisWeek: 6, lastWeek: 5 },
  ],
}

/** 商户工作台汇总(对接 `POST /data/station/workbench/merchantSummary`,当前用 Mock) */
export function useMerchantWorkbenchQuery() {
  return useQuery<IMerchantWorkbenchResponse, Error>({
    queryKey: ['workbench', 'merchant', 'summary'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300))
      return { code: 0, msg: 'success', data: MOCK_MERCHANT_WORKBENCH }
    },
    staleTime: 60_000,
  })
}

// ==================== 居委会工作台 ====================

/** City Data 居委会汇总(对接文档 §3 OrgWorkbenchSummaryVO) */
export interface IOrgCityDataVO {
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
}

/** 居委会本库统计(City Data 未覆盖:反馈/知识阅读/AI) */
export interface IOrgLocalStatsVO {
  feedbackPendingCount: number
  knowledgeReadCount: number
  aiConversationCount: number
}

export interface IOrgWorkbenchVO extends IOrgCityDataVO, IOrgLocalStatsVO {}

export type IOrgWorkbenchResponse = IResponse<IOrgWorkbenchVO>

const MOCK_ORG_WORKBENCH: IOrgWorkbenchVO = {
  noticePendingCount: 0,
  noticePublishedCount: 18,
  activityPendingCount: 2,
  activityPublishedCount: 9,
  dynamicPendingCount: 3,
  dynamicPublishedCount: 45,
  specialPendingCount: 1,
  specialPublishedCount: 6,
  bannerPendingCount: 0,
  bannerPublishedCount: 4,
  leaveMessagePending: 5,
  leaveMessageReplied: 27,
  leaveMessageTotal: 32,
  hotlineCount: 8,
  serviceCount: 11,
  ongoingActivityCount: 3,
  upcomingActivityCount: 2,
  expiringActivityCount: 1,
  recommendActivityCount: 4,
  feedbackPendingCount: 3,
  knowledgeReadCount: 512,
  aiConversationCount: 67,
}

/** 居委会工作台汇总(对接 `POST /data/station/workbench/orgSummary`,当前用 Mock) */
export function useOrgWorkbenchQuery() {
  return useQuery<IOrgWorkbenchResponse, Error>({
    queryKey: ['workbench', 'org', 'summary'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300))
      return { code: 0, msg: 'success', data: MOCK_ORG_WORKBENCH }
    },
    staleTime: 60_000,
  })
}
