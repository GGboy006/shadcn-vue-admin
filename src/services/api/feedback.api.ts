import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

// ==================== 类型 ====================

/** 反馈状态(对接文档 2 节 / 枚举速查):1=待处理,2=已处理,3=已回复 */
export type FeedbackStatus = 1 | 2 | 3
/** 反馈类型(对接文档 2 节 / 枚举速查):1=建议,2=表扬,3=投诉,4=其他 */
export type FeedbackType = 1 | 2 | 3 | 4

/** 反馈状态映射配置 */
export const feedbackStatusConfig: Record<FeedbackStatus, { label: string, variant: 'warning' | 'info' | 'success' }> = {
  1: { label: '待处理', variant: 'warning' },
  2: { label: '已处理', variant: 'info' },
  3: { label: '已回复', variant: 'success' },
}

/** 反馈类型映射配置 */
export const feedbackTypeConfig: Record<FeedbackType, { label: string, variant: 'default' | 'success' | 'destructive' | 'secondary' }> = {
  1: { label: '建议', variant: 'default' },
  2: { label: '表扬', variant: 'success' },
  3: { label: '投诉', variant: 'destructive' },
  4: { label: '其他', variant: 'secondary' },
}

/** 反馈统计 VO(对接文档 2.1 FeedbackStatsVO) */
export interface IFeedbackStats {
  /** 全部 */
  total: number
  /** 待处理 */
  pending: number
  /** 已处理 */
  processed: number
  /** 已回复 */
  replied: number
}

/** 分页列表查询参数(对接文档 2.2) */
export interface IFeedbackListQuery extends IPageParam {
  /** 姓名/手机/内容模糊 */
  keyword?: string
  /** 反馈状态:1=待处理,2=已处理,3=已回复 */
  status?: FeedbackStatus
  /** 反馈类型:1=建议,2=表扬,3=投诉,4=其他 */
  feedbackType?: FeedbackType
}

/** 意见反馈 VO(对接文档 2 节 FeedbackVO) */
export interface IFeedback {
  /** 反馈ID */
  feedbackId: number
  /** 站长ID */
  stationId?: number
  /** 用户ID */
  userId?: number
  /** 居民ID */
  residentId?: number
  /** 反馈人姓名 */
  userName?: string
  /** 反馈人手机 */
  userPhone?: string
  /** 反馈人账号 */
  userAccount?: string
  /** 头像 URL */
  avatar?: string
  /** 反馈类型:1=建议,2=表扬,3=投诉,4=其他 */
  feedbackType?: FeedbackType
  /** 反馈类型文案 */
  feedbackTypeLabel?: string
  /** 内容 */
  content?: string
  /** 图片 URL 列表 */
  images?: string[]
  /** 反馈状态:1=待处理,2=已处理,3=已回复 */
  status?: FeedbackStatus
  /** 状态文案 */
  statusLabel?: string
  /** 回复内容 */
  replyContent?: string
  /** 回复时间 */
  replyTime?: string
  /** 回复用户ID */
  replyUserId?: number
  /** 处理时间 */
  handleTime?: string
  /** 处理用户ID */
  handleUserId?: number
  /** 备注 */
  remark?: string
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  updateTime?: string
}

/** 新增请求体(对接文档 2.4) */
export interface IFeedbackAddDTO {
  /** 反馈类型:1=建议,2=表扬,3=投诉,4=其他 */
  feedbackType: FeedbackType
  /** 内容,≤2000 */
  content: string
  /** 反馈用户ID */
  userId?: number
  /** 居民ID */
  residentId?: number
  /** 反馈人姓名,≤50 */
  userName?: string
  /** 反馈人手机,≤20 */
  userPhone?: string
  /** 头像 URL */
  avatar?: string
  /** 图片 URL 列表 */
  images?: string[]
  /** 备注,≤500 */
  remark?: string
}

/** 更新状态请求体(对接文档 2.5) */
export interface IFeedbackStatusDTO {
  /** 反馈ID */
  feedbackId: number
  /** 状态:1=待处理,2=已处理,3=已回复 */
  status: FeedbackStatus
}

/** 回复请求体(对接文档 2.6,回复后自动置为已回复) */
export interface IFeedbackReplyDTO {
  /** 反馈ID */
  feedbackId: number
  /** 回复内容,≤2000 */
  replyContent: string
}

/** 统计响应 */
export type IFeedbackStatsResponse = IResponse<IFeedbackStats>
/** 分页列表响应 */
export type IFeedbackListResponse = IResponse<IPageResult<IFeedback>>
/** 详情响应 */
export type IFeedbackDetailResponse = IResponse<IFeedback>

// ==================== API 封装 ====================

/** 获取意见反馈统计(对接文档 2.1,`/feedback/stats`) */
export function useGetFeedbackStatsQuery() {
  const { apiFetch } = useApiFetch()

  return useQuery<IFeedbackStatsResponse, Error>({
    queryKey: ['feedbackStats'],
    queryFn: async () => await apiFetch<IFeedbackStatsResponse>('/feedback/stats'),
    retry: false,
  })
}

/** 获取意见反馈分页列表(对接文档 2.2,`/feedback/page`) */
export function useGetFeedbackPageQuery(query: Ref<IFeedbackListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IFeedbackListResponse, Error>({
    queryKey: ['feedbackList', query],
    queryFn: async () => await apiFetch<IFeedbackListResponse>('/feedback/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 获取意见反馈详情(对接文档 2.3,`/feedback/{feedbackId}`,Long ID 路径参数) */
export function useGetFeedbackDetailQuery(feedbackId: Ref<number | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IFeedbackDetailResponse, Error>({
    queryKey: ['feedbackDetail', feedbackId],
    queryFn: async () => await apiFetch<IFeedbackDetailResponse>(`/feedback/${feedbackId.value}`),
    enabled: () => (enabled?.value ?? true) && feedbackId.value !== undefined,
    retry: false,
  })
}

/** 新增意见反馈(对接文档 2.4,联调/录入) */
export function useCreateFeedbackMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IFeedbackAddDTO>({
    mutationKey: ['createFeedback'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/feedback', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbackList'] })
      queryClient.invalidateQueries({ queryKey: ['feedbackStats'] })
    },
  })
}

/** 更新反馈状态(对接文档 2.5,`/feedback/status`) */
export function useUpdateFeedbackStatusMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IFeedbackStatusDTO>({
    mutationKey: ['updateFeedbackStatus'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/feedback/status', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbackList'] })
      queryClient.invalidateQueries({ queryKey: ['feedbackDetail'] })
      queryClient.invalidateQueries({ queryKey: ['feedbackStats'] })
    },
  })
}

/** 回复意见反馈(对接文档 2.6,`/feedback/reply`,自动置为已回复) */
export function useReplyFeedbackMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IFeedbackReplyDTO>({
    mutationKey: ['replyFeedback'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/feedback/reply', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbackList'] })
      queryClient.invalidateQueries({ queryKey: ['feedbackDetail'] })
      queryClient.invalidateQueries({ queryKey: ['feedbackStats'] })
    },
  })
}

/** 删除意见反馈(对接文档 2.7,`/feedback/{feedbackId}`) */
export function useDeleteFeedbackMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, number>({
    mutationKey: ['deleteFeedback'],
    mutationFn: async feedbackId => await apiFetch<IResponse<boolean>>(`/feedback/${feedbackId}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbackList'] })
      queryClient.invalidateQueries({ queryKey: ['feedbackStats'] })
    },
  })
}
