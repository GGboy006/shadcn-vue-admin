import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

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

/** 列表查询参数(对接文档 3.2,/neighborhood/cate/page) */
export interface INeighborhoodCateListQuery extends IPageParam {
  /** 关键词(模糊搜索) */
  keyword?: string
}

/** 分页列表响应 */
export type INeighborhoodCateListResponse = IResponse<IPageResult<INeighborhoodCate>>

/** 详情响应(与列表项字段一致) */
export type INeighborhoodCateDetailResponse = IResponse<INeighborhoodCate>

// ==================== API 封装 ====================

/**
 * 获取活动分类分页列表(对接文档 3.2,`/neighborhood/cate/page`)。
 *
 * 注意:`/cate/all` 后端只返回启用的分类,无法展示禁用项;
 * 分类管理需要看到全部(含禁用),故改用分页接口。
 * 分类数量通常不多,前端固定 `pageSize=99` 一次拉全量,不展示分页组件。
 *
 * @param query 分页参数(pageNum/pageSize),固定传 pageSize=99
 */
export function useGetCateListQuery(query: Ref<INeighborhoodCateListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<INeighborhoodCateListResponse, Error>({
    queryKey: ['neighborhoodCateList', query],
    queryFn: async () => await apiFetch<INeighborhoodCateListResponse>('/neighborhood/cate/page', {
      method: 'get',
      query: query.value,
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
      queryClient.invalidateQueries({ queryKey: ['neighborhoodCateList'] })
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
      queryClient.invalidateQueries({ queryKey: ['neighborhoodCateList'] })
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
      queryClient.invalidateQueries({ queryKey: ['neighborhoodCateList'] })
    },
  })
}
