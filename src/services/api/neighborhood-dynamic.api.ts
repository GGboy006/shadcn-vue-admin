import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

// ==================== 类型 ====================

/** 内容类型:1=文本,2=链接 */
export type DynamicContentType = 1 | 2
/** 审核状态:0=待审核,1=通过,2=未通过 */
export type DynamicAuditStatus = 0 | 1 | 2
/** 启用状态:1=启用,2=禁用 */
export type DynamicEnableStatus = 1 | 2

/** 审核状态映射配置 */
export const dynamicAuditStatusConfig: Record<DynamicAuditStatus, { label: string, variant: 'warning' | 'success' | 'destructive' }> = {
  0: { label: '待审核', variant: 'warning' },
  1: { label: '通过', variant: 'success' },
  2: { label: '未通过', variant: 'destructive' },
}

/** 启用状态映射配置 */
export const dynamicEnableStatusConfig: Record<DynamicEnableStatus, { label: string, variant: 'default' | 'secondary' }> = {
  1: { label: '启用', variant: 'default' },
  2: { label: '禁用', variant: 'secondary' },
}

/** 内容类型映射配置 */
export const dynamicContentTypeConfig: Record<DynamicContentType, { label: string, variant: 'default' | 'info' }> = {
  1: { label: '文本', variant: 'default' },
  2: { label: '链接', variant: 'info' },
}

/** 列表查询参数(对接文档 3.5) */
export interface INeighborhoodDynamicListQuery extends IPageParam {
  /** 关键词(模糊搜索) */
  keyword?: string
}

/** 居委会资讯动态 VO(对接文档 3.5,响应字段参照新增推理) */
export interface INeighborhoodDynamic {
  /** 唯一标识 */
  uniqueCode: string
  /** 企业标识(后端注入) */
  orgCode?: string
  /** 标题 */
  title: string
  /** 封面图 */
  poster?: string
  /** 内容类型:1=文本,2=链接 */
  contentType?: DynamicContentType
  /** 富文本内容(contentType=1 时) */
  content?: string
  /** 简介 */
  describes?: string
  /** 来源 */
  original?: string
  /** 来源地址 / H5 */
  sourceUrl?: string
  /** 关键词 */
  keywords?: string
  /** 作者 */
  authorName?: string
  /** 审核状态:0=待审核,1=通过,2=未通过 */
  status?: DynamicAuditStatus
  /** 排序 */
  torder?: number
  /** 1=启用,2=禁用 */
  isEnable?: DynamicEnableStatus
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  updateTime?: string
}

/** 新增请求体(对接文档 3.5 OrgDynamicAddReq) */
export interface INeighborhoodDynamicAddDTO {
  /** 标题 */
  title: string
  /** 封面图 */
  poster?: string
  /** 内容类型:1=文本,2=链接 */
  contentType?: DynamicContentType
  /** 富文本(contentType=1 时) */
  content?: string
  /** 简介 */
  describes?: string
  /** 来源 */
  original?: string
  /** 来源地址 / H5 */
  sourceUrl?: string
  /** 关键词 */
  keywords?: string
  /** 作者 */
  authorName?: string
  /** 审核状态 */
  status?: DynamicAuditStatus
  /** 排序 */
  torder?: number
  /** 启用状态 */
  isEnable?: DynamicEnableStatus
}

/** 更新请求体 = 新增 + uniqueCode */
export interface INeighborhoodDynamicUpdateDTO extends INeighborhoodDynamicAddDTO {
  /** 唯一标识 */
  uniqueCode: string
}

/** 分页列表响应 */
export type INeighborhoodDynamicListResponse = IResponse<IPageResult<INeighborhoodDynamic>>

/** 详情响应 */
export type INeighborhoodDynamicDetailResponse = IResponse<INeighborhoodDynamic>

// ==================== API 封装 ====================

/** 获取居委会资讯动态分页列表 */
export function useGetDynamicPageQuery(query: Ref<INeighborhoodDynamicListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<INeighborhoodDynamicListResponse, Error>({
    queryKey: ['neighborhoodDynamicList', query],
    queryFn: async () => await apiFetch<INeighborhoodDynamicListResponse>('/neighborhood/dynamic/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 获取居委会资讯动态详情 */
export function useGetDynamicDetailQuery(uniqueCode: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<INeighborhoodDynamicDetailResponse, Error>({
    queryKey: ['neighborhoodDynamicDetail', uniqueCode],
    queryFn: async () => await apiFetch<INeighborhoodDynamicDetailResponse>('/neighborhood/dynamic/detail', {
      method: 'get',
      query: { uniqueCode: uniqueCode.value },
    }),
    enabled: () => (enabled?.value ?? true) && !!uniqueCode.value,
    retry: false,
  })
}

/** 新增居委会资讯动态 */
export function useCreateDynamicMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, INeighborhoodDynamicAddDTO>({
    mutationKey: ['createNeighborhoodDynamic'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/neighborhood/dynamic', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodDynamicList'] })
    },
  })
}

/** 更新居委会资讯动态 */
export function useUpdateDynamicMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, INeighborhoodDynamicUpdateDTO>({
    mutationKey: ['updateNeighborhoodDynamic'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/neighborhood/dynamic', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodDynamicList'] })
      queryClient.invalidateQueries({ queryKey: ['neighborhoodDynamicDetail'] })
    },
  })
}

/** 删除居委会资讯动态 */
export function useDeleteDynamicMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deleteNeighborhoodDynamic'],
    mutationFn: async uniqueCode => await apiFetch<IResponse<boolean>>(`/neighborhood/dynamic/${uniqueCode}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodDynamicList'] })
    },
  })
}
