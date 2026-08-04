import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IResponse } from '../types/response.type'

// ==================== 类型 ====================

/** 启用状态:1=启用,2=禁用 */
export type CateEnableStatus = 1 | 2

/** 启用状态映射配置 */
export const cateEnableStatusConfig: Record<CateEnableStatus, { label: string, variant: 'default' | 'secondary' }> = {
  1: { label: '启用', variant: 'default' },
  2: { label: '禁用', variant: 'secondary' },
}

/** 活动分类 VO(对接文档 3.2 TblAppEnterpriseCateResp) */
export interface INeighborhoodCate {
  /** 唯一标识 */
  uniqueCode: string
  /** 企业标识(后端注入) */
  orgCode?: string
  /** 名称 */
  name: string
  /** 1=企业活动,2=商品;居委会固定为活动类,后端注入,前端不传 */
  type?: number
  /** 排序 */
  torder?: number
  /** 1=启用,2=禁用 */
  isEnable?: CateEnableStatus
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  updateTime?: string
}

/** 新增请求体(对接文档 3.2 OrgCateAddReq) */
export interface INeighborhoodCateAddDTO {
  /** 名称 */
  name: string
  /** 排序 */
  torder?: number
  /** 1=启用,2=禁用 */
  isEnable?: CateEnableStatus
}

/** 更新请求体 = 新增 + uniqueCode */
export interface INeighborhoodCateUpdateDTO extends INeighborhoodCateAddDTO {
  /** 唯一标识 */
  uniqueCode: string
}

/** 全量列表响应 */
export type INeighborhoodCateListResponse = IResponse<INeighborhoodCate[]>

/** 详情响应(与列表项字段一致) */
export type INeighborhoodCateDetailResponse = IResponse<INeighborhoodCate>

// ==================== API 封装 ====================

/**
 * 获取全部活动分类(对接文档 3.2,`/neighborhood/cate/all`)。
 *
 * 分类数量通常不多,一次拉全量供卡片列表渲染。
 */
export function useGetCateAllQuery() {
  const { apiFetch } = useApiFetch()

  return useQuery<INeighborhoodCateListResponse, Error>({
    queryKey: ['neighborhoodCateAll'],
    queryFn: async () => await apiFetch<INeighborhoodCateListResponse>('/neighborhood/cate/all', {
      method: 'get',
    }),
    retry: false,
  })
}

/** 获取活动分类详情 */
export function useGetCateDetailQuery(uniqueCode: Ref<string | undefined>) {
  const { apiFetch } = useApiFetch()

  return useQuery<INeighborhoodCateDetailResponse, Error>({
    queryKey: ['neighborhoodCateDetail', uniqueCode],
    queryFn: async () => await apiFetch<INeighborhoodCateDetailResponse>('/neighborhood/cate/detail', {
      method: 'get',
      query: { uniqueCode: uniqueCode.value },
    }),
    enabled: () => !!uniqueCode.value,
    retry: false,
  })
}

/** 新增活动分类 */
export function useCreateCateMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, INeighborhoodCateAddDTO>({
    mutationKey: ['createNeighborhoodCate'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/neighborhood/cate', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodCateAll'] })
    },
  })
}

/** 更新活动分类 */
export function useUpdateCateMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, INeighborhoodCateUpdateDTO>({
    mutationKey: ['updateNeighborhoodCate'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/neighborhood/cate', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodCateAll'] })
      queryClient.invalidateQueries({ queryKey: ['neighborhoodCateDetail'] })
    },
  })
}

/** 删除活动分类 */
export function useDeleteCateMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deleteNeighborhoodCate'],
    mutationFn: async uniqueCode => await apiFetch<IResponse<boolean>>(`/neighborhood/cate/${uniqueCode}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodCateAll'] })
    },
  })
}
