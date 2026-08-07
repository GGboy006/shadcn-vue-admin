import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

// ==================== 类型 ====================

/**
 * 小区服务 type(对接文档 14 节 / 枚举速查 · 小区服务 type)。
 * 注意:type=17 为居民 AI 工具,开通请优先用 `/resident/ai-tool/assign`(后端固定 type=17 且写 thirdId)。
 */
export type CommunityServiceType
  = | 1
    | 2
    | 3
    | 14
    | 15
    | 16
    | 17

/** 启用状态:1=启用,2=禁用 */
export type CommunityServiceEnableStatus = 1 | 2
/** 位置:1=顶,2=中,3=底 */
export type CommunityServiceLocation = 1 | 2 | 3
/** 服务大类:1=社区服务,2=阅读服务 */
export type CommunityServiceServiceType = 1 | 2

/** 小区服务 type 映射配置(对接文档 14 节) */
export const communityServiceTypeConfig: Record<CommunityServiceType, { label: string, variant: 'default' | 'info' | 'success' | 'warning' | 'secondary' | 'destructive' }> = {
  1: { label: '小程序', variant: 'default' },
  2: { label: 'H5网页', variant: 'info' },
  3: { label: '阅览室', variant: 'success' },
  14: { label: '商户', variant: 'warning' },
  15: { label: 'AI助手', variant: 'secondary' },
  16: { label: '社区商品', variant: 'destructive' },
  17: { label: '社区AI助手', variant: 'info' },
}

/** 位置映射配置 */
export const communityServiceLocationConfig: Record<CommunityServiceLocation, { label: string }> = {
  1: { label: '顶部' },
  2: { label: '中部' },
  3: { label: '底部' },
}

/** 启用状态映射配置 */
export const communityServiceEnableStatusConfig: Record<CommunityServiceEnableStatus, { label: string, variant: 'default' | 'secondary' }> = {
  1: { label: '启用', variant: 'default' },
  2: { label: '禁用', variant: 'secondary' },
}

/** 分页列表查询参数(对接文档 13 节) */
export interface ICommunityServiceListQuery extends IPageParam {
  /** 关键词(模糊搜索) */
  keyword?: string
  /** 分类编码 */
  cateCode?: string
  /** 服务类型(可选,如 17=居民AI工具) */
  type?: CommunityServiceType
}

/** 小区服务 VO(对接文档 13 节 TblCommunityServiceResp) */
export interface ICommunityService {
  /** 主键ID */
  id: number
  /** 唯一标识 */
  uniqueCode: string
  /** 名称 */
  name: string
  /** 封面图 */
  poster?: string
  /** 背景图 */
  backgroundPoster?: string
  /** 描述 */
  describe?: string
  /** 排序 */
  torder?: number
  /** 跳转链接 */
  linkUrl?: string
  /** 启用状态:1=启用,2=禁用 */
  isEnable?: CommunityServiceEnableStatus
  /** 位置:1=顶,2=中,3=底 */
  location?: CommunityServiceLocation
  /** 服务类型(见枚举) */
  type?: CommunityServiceType
  /** 分类编码 */
  cateCode?: string
  /** 分类名称 */
  cateName?: string
  /** 服务大类:1=社区服务,2=阅读服务 */
  serviceType?: CommunityServiceServiceType
  /** 微信小程序 APPID */
  appId?: string
  /** 微信原始 appid */
  originalAppId?: string
  /** 百度小程序 key */
  bdAppKey?: string
  /** 外部标识(商户码/thirdId 等) */
  otherCode?: string
  /** 阅览室编码 */
  readingCode?: string
  /** 服务编码 */
  serviceCode?: string
  /** H5 地址 */
  h5Url?: string
  /** APP 地址 */
  appUrl?: string
  /** 地址 */
  address?: string
  /** 营业时间 */
  businessHours?: string
  /** 合伙人标识(后端填充) */
  partnerId?: string
  /** 多服务栏目 */
  serviceList?: string
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  operatorTime?: string
}

/** 新增请求体(对接文档 13 节) */
export interface ICommunityServiceAddDTO {
  /** 名称 */
  name: string
  /** 封面图 */
  poster?: string
  /** 背景图 */
  backgroundPoster?: string
  /** 描述 */
  describe?: string
  /** 排序 */
  torder?: number
  /** 启用状态:1=启用,2=禁用 */
  isEnable?: CommunityServiceEnableStatus
  /** 位置:1=顶,2=中,3=底 */
  location?: CommunityServiceLocation
  /** 服务类型(见枚举) */
  type?: CommunityServiceType
  /** 分类编码 */
  cateCode?: string
  /** 分类名称 */
  cateName?: string
  /** 服务大类:1=社区服务,2=阅读服务 */
  serviceType?: CommunityServiceServiceType
  /** 外部标识(商户码/thirdId 等) */
  otherCode?: string
  /** 微信小程序 APPID */
  appId?: string
  /** 微信原始 appid */
  originalAppId?: string
  /** 百度小程序 key */
  bdAppKey?: string
  /** 阅览室编码 */
  readingCode?: string
  /** 服务编码 */
  serviceCode?: string
  /** H5 地址 */
  h5Url?: string
  /** APP 地址 */
  appUrl?: string
  /** 跳转链接 */
  linkUrl?: string
  /** 地址 */
  address?: string
  /** 营业时间 */
  businessHours?: string
  /** 多服务栏目 */
  serviceList?: string
}

/** 更新请求体 = 新增 + uniqueCode */
export interface ICommunityServiceUpdateDTO extends ICommunityServiceAddDTO {
  /** 唯一标识 */
  uniqueCode: string
}

/** 分页列表响应 */
export type ICommunityServiceListResponse = IResponse<IPageResult<ICommunityService>>

// ==================== API 封装 ====================

/**
 * 获取小区服务分页列表(对接文档 13 节,`/community/service/page`)。
 * 无独立 detail 接口,编辑表单用列表数据回填(列表返回即全字段)。
 */
export function useGetServicePageQuery(query: Ref<ICommunityServiceListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ICommunityServiceListResponse, Error>({
    queryKey: ['communityServiceList', query],
    queryFn: async () => await apiFetch<ICommunityServiceListResponse>('/community/service/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 新增小区服务 */
export function useCreateServiceMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, ICommunityServiceAddDTO>({
    mutationKey: ['createCommunityService'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/community/service', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityServiceList'] })
    },
  })
}

/** 更新小区服务 */
export function useUpdateServiceMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, ICommunityServiceUpdateDTO>({
    mutationKey: ['updateCommunityService'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/community/service', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityServiceList'] })
    },
  })
}

/** 删除小区服务 */
export function useDeleteServiceMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deleteCommunityService'],
    mutationFn: async uniqueCode => await apiFetch<IResponse<boolean>>(`/community/service/${uniqueCode}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityServiceList'] })
    },
  })
}
