import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

// ==================== 类型 ====================

/** 启用状态:1=启用,2=禁用 */
export type ServiceGuideEnableStatus = 1 | 2

/** 启用状态映射配置 */
export const serviceGuideEnableStatusConfig: Record<ServiceGuideEnableStatus, { label: string, variant: 'default' | 'secondary' }> = {
  1: { label: '启用', variant: 'default' },
  2: { label: '禁用', variant: 'secondary' },
}

/** 列表查询参数(对接文档 3.9) */
export interface INeighborhoodServiceGuideListQuery extends IPageParam {
  /** 关键词(模糊搜索) */
  keyword?: string
}

/** 居委会服务热线 VO(对接文档 3.9 TblAppEnterpriseServiceGuideResp) */
export interface INeighborhoodServiceGuide {
  /** 唯一标识 */
  uniqueCode: string
  /** 单位 */
  unit?: string
  /** 地址 */
  address?: string
  /** 电话 */
  phone?: string
  /** 描述 */
  describe?: string
  /** 1=启用,2=禁用 */
  isEnable?: ServiceGuideEnableStatus
  /** 排序 */
  torder?: number
  /** 合伙人标识 */
  partnerId?: string
  /** 合伙人父级标识 */
  partnerPid?: string
  /** 企业标识(后端注入) */
  orgCode?: string
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  updateTime?: string
}

/** 新增请求体(对接文档 3.9 EnterpriseServiceGuideAddReq) */
export interface INeighborhoodServiceGuideAddDTO {
  /** 单位 */
  unit?: string
  /** 地址 */
  address?: string
  /** 电话 */
  phone?: string
  /** 描述 */
  describe?: string
  /** 排序 */
  torder?: number
  /** 启用状态 */
  isEnable?: ServiceGuideEnableStatus
}

/** 更新请求体(对接文档 3.9 EnterpriseServiceGuideUpdateReq) */
export interface INeighborhoodServiceGuideUpdateDTO extends INeighborhoodServiceGuideAddDTO {
  /** 唯一标识 */
  uniqueCode: string
}

/** 分页列表响应 */
export type INeighborhoodServiceGuideListResponse = IResponse<IPageResult<INeighborhoodServiceGuide>>

/** 详情响应 */
export type INeighborhoodServiceGuideDetailResponse = IResponse<INeighborhoodServiceGuide>

// ==================== API 封装 ====================

/**
 * 获取服务热线分页列表(对接文档 3.9,`/neighborhood/serviceGuide/page`)。
 *
 * 服务热线数量通常不多,前端固定 `pageSize=99` 一次拉全量,不展示分页组件。
 */
export function useGetServiceGuidePageQuery(query: Ref<INeighborhoodServiceGuideListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<INeighborhoodServiceGuideListResponse, Error>({
    queryKey: ['neighborhoodServiceGuideList', query],
    queryFn: async () => await apiFetch<INeighborhoodServiceGuideListResponse>('/neighborhood/serviceGuide/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 获取服务热线详情 */
export function useGetServiceGuideDetailQuery(uniqueCode: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<INeighborhoodServiceGuideDetailResponse, Error>({
    queryKey: ['neighborhoodServiceGuideDetail', uniqueCode],
    queryFn: async () => await apiFetch<INeighborhoodServiceGuideDetailResponse>('/neighborhood/serviceGuide/detail', {
      method: 'get',
      query: { uniqueCode: uniqueCode.value },
    }),
    enabled: () => (enabled?.value ?? true) && !!uniqueCode.value,
    retry: false,
  })
}

/** 新增服务热线 */
export function useCreateServiceGuideMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, INeighborhoodServiceGuideAddDTO>({
    mutationKey: ['createNeighborhoodServiceGuide'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/neighborhood/serviceGuide', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodServiceGuideList'] })
    },
  })
}

/** 更新服务热线 */
export function useUpdateServiceGuideMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, INeighborhoodServiceGuideUpdateDTO>({
    mutationKey: ['updateNeighborhoodServiceGuide'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/neighborhood/serviceGuide', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodServiceGuideList'] })
      queryClient.invalidateQueries({ queryKey: ['neighborhoodServiceGuideDetail'] })
    },
  })
}

/** 删除服务热线 */
export function useDeleteServiceGuideMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deleteNeighborhoodServiceGuide'],
    mutationFn: async uniqueCode => await apiFetch<IResponse<boolean>>(`/neighborhood/serviceGuide/${uniqueCode}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodServiceGuideList'] })
    },
  })
}
