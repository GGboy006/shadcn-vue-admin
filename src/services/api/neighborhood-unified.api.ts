import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

// ==================== 类型 ====================

/**
 * 栏目类型(对接文档附录 B.3)。
 * 与广告/服务的 type 不同,栏目有独立的取值集合。
 */
export type UnifiedType
  = | 7
    | 29
    | 31
    | 32
    | 33
    | 35
    | 36
    | 37
    | 41
    | 42
    | 61

/** 位置:1=上部,2=中部,3=底部 */
export type UnifiedPosition = 1 | 2 | 3
/** 启用状态:1=启用,2=禁用 */
export type UnifiedEnableStatus = 1 | 2

/** 栏目类型映射配置 */
export const unifiedTypeConfig: Record<UnifiedType, { label: string }> = {
  7: { label: 'H5' },
  29: { label: '企业文章' },
  31: { label: '企业简介' },
  32: { label: '联系我们' },
  33: { label: '公告通知' },
  35: { label: '加入企业' },
  36: { label: '企业招聘' },
  37: { label: '在线留言' },
  41: { label: '企业认证' },
  42: { label: '企业文章详情' },
  61: { label: '社区服务热线' },
}

/** 位置映射配置 */
export const unifiedPositionConfig: Record<UnifiedPosition, { label: string }> = {
  1: { label: '上部' },
  2: { label: '中部' },
  3: { label: '底部' },
}

/** 启用状态映射配置 */
export const unifiedEnableStatusConfig: Record<UnifiedEnableStatus, { label: string, variant: 'default' | 'secondary' }> = {
  1: { label: '启用', variant: 'default' },
  2: { label: '禁用', variant: 'secondary' },
}

/** 列表查询参数(对接文档 3.6) */
export interface INeighborhoodUnifiedListQuery extends IPageParam {
  /** 关键词(模糊搜索) */
  keyword?: string
}

/** 居委会栏目 VO(对接文档 3.6,响应字段参照新增推理) */
export interface INeighborhoodUnified {
  /** 唯一标识 */
  uniqueCode: string
  /** 企业标识(后端注入) */
  orgCode?: string
  /** 名称 */
  name: string
  /** 栏目类型(附录 B.3) */
  type: UnifiedType
  /** 封面 */
  poster?: string
  /** 排序 */
  torder?: number
  /** 位置:1=上部,2=中部,3=底部 */
  position?: UnifiedPosition
  /** 1=启用,2=禁用 */
  isEnable?: UnifiedEnableStatus
  /** 其他标识 / H5 */
  resCode?: string
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  updateTime?: string
}

/** 新增请求体(对接文档 3.6 OrgUnifiedAddReq) */
export interface INeighborhoodUnifiedAddDTO {
  /** 名称 */
  name: string
  /** 栏目类型(附录 B.3) */
  type: UnifiedType
  /** 封面 */
  poster?: string
  /** 排序 */
  torder?: number
  /** 位置:1=上部,2=中部,3=底部 */
  position?: UnifiedPosition
  /** 启用状态 */
  isEnable?: UnifiedEnableStatus
  /** 其他标识 / H5 */
  resCode?: string
}

/** 更新请求体 = 新增 + uniqueCode */
export interface INeighborhoodUnifiedUpdateDTO extends INeighborhoodUnifiedAddDTO {
  /** 唯一标识 */
  uniqueCode: string
}

/** 分页列表响应 */
export type INeighborhoodUnifiedListResponse = IResponse<IPageResult<INeighborhoodUnified>>

/** 详情响应 */
export type INeighborhoodUnifiedDetailResponse = IResponse<INeighborhoodUnified>

// ==================== API 封装 ====================

/** 获取居委会栏目分页列表 */
export function useGetUnifiedPageQuery(query: Ref<INeighborhoodUnifiedListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<INeighborhoodUnifiedListResponse, Error>({
    queryKey: ['neighborhoodUnifiedList', query],
    queryFn: async () => await apiFetch<INeighborhoodUnifiedListResponse>('/neighborhood/unified/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 获取居委会栏目详情 */
export function useGetUnifiedDetailQuery(uniqueCode: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<INeighborhoodUnifiedDetailResponse, Error>({
    queryKey: ['neighborhoodUnifiedDetail', uniqueCode],
    queryFn: async () => await apiFetch<INeighborhoodUnifiedDetailResponse>('/neighborhood/unified/detail', {
      method: 'get',
      query: { uniqueCode: uniqueCode.value },
    }),
    enabled: () => (enabled?.value ?? true) && !!uniqueCode.value,
    retry: false,
  })
}

/** 新增居委会栏目 */
export function useCreateUnifiedMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, INeighborhoodUnifiedAddDTO>({
    mutationKey: ['createNeighborhoodUnified'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/neighborhood/unified', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodUnifiedList'] })
    },
  })
}

/** 更新居委会栏目 */
export function useUpdateUnifiedMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, INeighborhoodUnifiedUpdateDTO>({
    mutationKey: ['updateNeighborhoodUnified'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/neighborhood/unified', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodUnifiedList'] })
      queryClient.invalidateQueries({ queryKey: ['neighborhoodUnifiedDetail'] })
    },
  })
}

/** 删除居委会栏目 */
export function useDeleteUnifiedMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deleteNeighborhoodUnified'],
    mutationFn: async uniqueCode => await apiFetch<IResponse<boolean>>(`/neighborhood/unified/${uniqueCode}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodUnifiedList'] })
    },
  })
}
