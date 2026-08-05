import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

// ==================== 类型 ====================

/** 启用状态:1=启用,2=禁用 */
export type SpecialEnableStatus = 1 | 2

/** 启用状态映射配置 */
export const specialEnableStatusConfig: Record<SpecialEnableStatus, { label: string, variant: 'default' | 'secondary' }> = {
  1: { label: '启用', variant: 'default' },
  2: { label: '禁用', variant: 'secondary' },
}

/** 列表查询参数(对接文档 3.7) */
export interface INeighborhoodSpecialListQuery extends IPageParam {
  /** 关键词(模糊搜索) */
  keyword?: string
}

/** 居委会专题 VO(对接文档 3.7 TblAppEnterpriseSpecialResp) */
export interface INeighborhoodSpecial {
  /** 主键 ID */
  id?: number
  /** 唯一标识 */
  uniqueCode: string
  /** 专题名称 */
  name: string
  /** 封面图 */
  poster?: string
  /** 备注 */
  mark?: string
  /** 1=启用,2=禁用 */
  isEnable?: SpecialEnableStatus
  /** 排序 */
  torder?: number
  /** 合伙人标识 */
  partnerId?: string
  /** 企业标识(后端注入) */
  orgCode?: string
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  updateTime?: string
}

/** 新增请求体(对接文档 3.7 OrgSpecialAddReq) */
export interface INeighborhoodSpecialAddDTO {
  /** 专题名称 */
  name: string
  /** 封面图 */
  poster?: string
  /** 备注 */
  mark?: string
  /** 启用状态 */
  isEnable?: SpecialEnableStatus
  /** 排序 */
  torder?: number
}

/** 更新请求体 = 新增 + uniqueCode */
export interface INeighborhoodSpecialUpdateDTO extends INeighborhoodSpecialAddDTO {
  /** 唯一标识 */
  uniqueCode: string
}

/** 分页列表响应 */
export type INeighborhoodSpecialListResponse = IResponse<IPageResult<INeighborhoodSpecial>>

/** 详情响应 */
export type INeighborhoodSpecialDetailResponse = IResponse<INeighborhoodSpecial>

// ==================== API 封装 ====================

/** 获取居委会专题分页列表 */
export function useGetSpecialPageQuery(query: Ref<INeighborhoodSpecialListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<INeighborhoodSpecialListResponse, Error>({
    queryKey: ['neighborhoodSpecialList', query],
    queryFn: async () => await apiFetch<INeighborhoodSpecialListResponse>('/neighborhood/special/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 获取居委会专题详情 */
export function useGetSpecialDetailQuery(uniqueCode: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<INeighborhoodSpecialDetailResponse, Error>({
    queryKey: ['neighborhoodSpecialDetail', uniqueCode],
    queryFn: async () => await apiFetch<INeighborhoodSpecialDetailResponse>('/neighborhood/special/detail', {
      method: 'get',
      query: { uniqueCode: uniqueCode.value },
    }),
    enabled: () => (enabled?.value ?? true) && !!uniqueCode.value,
    retry: false,
  })
}

/** 新增居委会专题 */
export function useCreateSpecialMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, INeighborhoodSpecialAddDTO>({
    mutationKey: ['createNeighborhoodSpecial'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/neighborhood/special', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodSpecialList'] })
    },
  })
}

/** 更新居委会专题 */
export function useUpdateSpecialMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, INeighborhoodSpecialUpdateDTO>({
    mutationKey: ['updateNeighborhoodSpecial'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/neighborhood/special', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodSpecialList'] })
      queryClient.invalidateQueries({ queryKey: ['neighborhoodSpecialDetail'] })
    },
  })
}

/** 删除居委会专题 */
export function useDeleteSpecialMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deleteNeighborhoodSpecial'],
    mutationFn: async uniqueCode => await apiFetch<IResponse<boolean>>(`/neighborhood/special/${uniqueCode}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodSpecialList'] })
    },
  })
}
