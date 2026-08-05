import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

// ==================== 类型 ====================

/**
 * 服务跳转类型(对接文档附录 B.4,3.11 用):
 * 7=H5,8=专题,27=小程序
 * (百度小程序 11 在广告里有,居委会服务文档未列,暂不开放)
 */
export type ServiceType = 7 | 8 | 27
/** 启用状态:1=启用,2=禁用 */
export type ServiceEnableStatus = 1 | 2

/** 跳转类型映射配置 */
export const serviceTypeConfig: Record<ServiceType, { label: string, variant: 'default' | 'info' | 'success' }> = {
  7: { label: 'H5', variant: 'default' },
  8: { label: '专题', variant: 'info' },
  27: { label: '小程序', variant: 'success' },
}

/** 启用状态映射配置 */
export const serviceEnableStatusConfig: Record<ServiceEnableStatus, { label: string, variant: 'default' | 'secondary' }> = {
  1: { label: '启用', variant: 'default' },
  2: { label: '禁用', variant: 'secondary' },
}

/** 列表查询参数(对接文档 3.11) */
export interface INeighborhoodServiceListQuery extends IPageParam {
  /** 关键词(模糊搜索) */
  keyword?: string
}

/** 居委会服务 VO(对接文档 3.11 TblAppEnterpriseServiceResp) */
export interface INeighborhoodService {
  /** 主键 ID */
  id?: number
  /** 唯一标识 */
  uniqueCode: string
  /** 名称 */
  name: string
  /** 类型:8=专题,7=H5,27=小程序 */
  type: ServiceType
  /** 封面 */
  poster?: string
  /** 微信小程序 APPID */
  appId?: string
  /** 微信原始 appid */
  originalAppId?: string
  /** 百度小程序 key */
  bdAppKey?: string
  /** H5 地址 */
  h5Url?: string
  /** 排序 */
  torder?: number
  /** 1=启用,2=禁用 */
  isEnable?: ServiceEnableStatus
  /** 其他标识 */
  resCode?: string
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

/** 新增请求体(对接文档 3.11 OrgServiceAddReq) */
export interface INeighborhoodServiceAddDTO {
  /** 名称 */
  name: string
  /** 类型:8=专题,7=H5,27=小程序 */
  type: ServiceType
  /** 封面 */
  poster?: string
  /** 微信小程序 APPID */
  appId?: string
  /** 微信原始 appid */
  originalAppId?: string
  /** 百度小程序 key */
  bdAppKey?: string
  /** H5 地址 */
  h5Url?: string
  /** 排序 */
  torder?: number
  /** 启用状态 */
  isEnable?: ServiceEnableStatus
  /** 其他标识 */
  resCode?: string
}

/** 更新请求体 = 新增 + uniqueCode */
export interface INeighborhoodServiceUpdateDTO extends INeighborhoodServiceAddDTO {
  /** 唯一标识 */
  uniqueCode: string
}

/** 分页列表响应 */
export type INeighborhoodServiceListResponse = IResponse<IPageResult<INeighborhoodService>>

/** 详情响应 */
export type INeighborhoodServiceDetailResponse = IResponse<INeighborhoodService>

// ==================== API 封装 ====================

/** 获取居委会服务分页列表 */
export function useGetServicePageQuery(query: Ref<INeighborhoodServiceListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<INeighborhoodServiceListResponse, Error>({
    queryKey: ['neighborhoodServiceList', query],
    queryFn: async () => await apiFetch<INeighborhoodServiceListResponse>('/neighborhood/service/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 获取居委会服务详情 */
export function useGetServiceDetailQuery(uniqueCode: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<INeighborhoodServiceDetailResponse, Error>({
    queryKey: ['neighborhoodServiceDetail', uniqueCode],
    queryFn: async () => await apiFetch<INeighborhoodServiceDetailResponse>('/neighborhood/service/detail', {
      method: 'get',
      query: { uniqueCode: uniqueCode.value },
    }),
    enabled: () => (enabled?.value ?? true) && !!uniqueCode.value,
    retry: false,
  })
}

/** 新增居委会服务 */
export function useCreateServiceMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, INeighborhoodServiceAddDTO>({
    mutationKey: ['createNeighborhoodService'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/neighborhood/service', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodServiceList'] })
    },
  })
}

/** 更新居委会服务 */
export function useUpdateServiceMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, INeighborhoodServiceUpdateDTO>({
    mutationKey: ['updateNeighborhoodService'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/neighborhood/service', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodServiceList'] })
      queryClient.invalidateQueries({ queryKey: ['neighborhoodServiceDetail'] })
    },
  })
}

/** 删除居委会服务 */
export function useDeleteServiceMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deleteNeighborhoodService'],
    mutationFn: async uniqueCode => await apiFetch<IResponse<boolean>>(`/neighborhood/service/${uniqueCode}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodServiceList'] })
    },
  })
}
