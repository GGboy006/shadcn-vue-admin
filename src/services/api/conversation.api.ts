import { useQuery } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IResponse } from '../types/response.type'

/** 服务模式：0-AI托管 1-人工接管 2-待人工介入 */
export type ServiceMode = 0 | 1 | 2

/** 用户标签：3-站长 4-商户 5-物业 6-居委会 7-居民 */
export type UserTag = 3 | 4 | 5 | 6 | 7

/** 服务模式映射配置 */
export const serviceModeConfig: Record<ServiceMode, { label: string, variant: 'default' | 'secondary' | 'destructive' }> = {
  0: { label: 'AI托管', variant: 'default' },
  1: { label: '人工接管', variant: 'secondary' },
  2: { label: '待人工介入', variant: 'destructive' },
}

/** 用户标签映射配置 */
export const userTagConfig: Record<UserTag, string> = {
  3: '站长',
  4: '商户',
  5: '物业',
  6: '居委会',
  7: '居民',
}

/** 会话信息 VO */
export interface IConversation {
  /** 会话ID */
  chatId: number
  /** 会话标题 */
  title: string
  /** 用户ID */
  userId: number
  /** 类型 */
  type: number
  /** 小区站长ID */
  orgCode: string
  /** 服务模式：0-AI托管 1-人工接管 2-待人工介入 */
  serviceMode: ServiceMode
  /** 当前接管人ID */
  operatorId: number
  /** 当前接管人名称 */
  operatorName: string
  /** 用户标签：3-站长 4-商户 5-物业 6-居委会 7-居民 */
  userTag: UserTag
  /** 接管时间 */
  takeoverTime: string
  /** 切回AI时间 */
  returnToAiTime: string
  /** 待处理消息数（人工模式下站长未读） */
  pendingCount: number
  /** 最后消息时间 */
  lastMessageTime: string
  /** 最后消息预览 */
  lastMessagePreview: string
}

/** 分页结果 */
export interface IPageResult<T> {
  /** 当前页 */
  pageNum: number
  /** 每页的数量 */
  pageSize: number
  /** 总记录数 */
  total: number
  /** 总页数 */
  pages: number
  /** 结果集 */
  list: T[]
  /** 是否为空 */
  emptyFlag: boolean
}

/** 会话列表查询参数 */
export interface IConversationListQuery {
  /** 查询状态：空-全部，1-待介入，2-已完成 */
  status?: string
  /** 页码 */
  pageNum: number
  /** 每页数量 */
  pageSize: number
  /** 是否查询总条数 */
  searchCount?: string
  /** 排序字段集合 */
  sortItemList?: string
}

/** 会话列表响应 */
export type IConversationListResponse = IResponse<IPageResult<IConversation>>

// ==================== API 封装 ====================

/** 获取会话分页列表 */
export function useGetConversationListQuery(query: Ref<IConversationListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IConversationListResponse, Error>({
    queryKey: ['conversationList', query],
    queryFn: async () => await apiFetch<IConversationListResponse>('/aiCommon/conversationList', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}
