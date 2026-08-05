import { useQuery } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

// ==================== 类型 ====================

/** 列表查询参数(对接文档 3.10) */
export interface INeighborhoodLeaveMessageListQuery extends IPageParam {
  /** 关键词(模糊搜索) */
  keyword?: string
}

/** 在线留言 VO(对接文档 3.10 TblAppEnterpriseLeaveMessageResp) */
export interface INeighborhoodLeaveMessage {
  /** 唯一标识 */
  uniqueCode: string
  /** 留言内容 */
  message?: string
  /** 手机号 */
  phone?: string
  /** 姓名 */
  name?: string
  /** 用户标识 */
  userUniqueCode?: string
  /** 企业标识 */
  orgCode?: string
  /** 合伙人标识 */
  partnerId?: string
  /** 合伙人父级标识 */
  partnerPid?: string
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  updateTime?: string
}

/** 分页列表响应 */
export type INeighborhoodLeaveMessageListResponse = IResponse<IPageResult<INeighborhoodLeaveMessage>>

// ==================== API 封装 ====================

/**
 * 获取在线留言分页列表(对接文档 3.10,`/neighborhood/leaveMessage/page`)。
 *
 * 居委会后台仅提供列表查看,无新增/更新/删除接口。
 */
export function useGetLeaveMessagePageQuery(query: Ref<INeighborhoodLeaveMessageListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<INeighborhoodLeaveMessageListResponse, Error>({
    queryKey: ['neighborhoodLeaveMessageList', query],
    queryFn: async () => await apiFetch<INeighborhoodLeaveMessageListResponse>('/neighborhood/leaveMessage/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}
