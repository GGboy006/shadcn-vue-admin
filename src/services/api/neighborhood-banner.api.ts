import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

// ==================== 类型 ====================

/** 广告位置:1=上部,2=中部,3=底部 */
export type BannerPosition = 1 | 2 | 3
/** 广告跳转类型:7=H5,8=专题,11=百度小程序,27=小程序 */
export type BannerType = 7 | 8 | 11 | 27
/** 启用状态:1=启用,2=禁用 */
export type BannerEnableStatus = 1 | 2

/** 位置映射配置 */
export const bannerPositionConfig: Record<BannerPosition, { label: string }> = {
  1: { label: '上部' },
  2: { label: '中部' },
  3: { label: '底部' },
}

/** 跳转类型映射配置 */
export const bannerTypeConfig: Record<BannerType, { label: string, variant: 'default' | 'info' | 'secondary' | 'success' }> = {
  7: { label: 'H5', variant: 'default' },
  8: { label: '专题', variant: 'info' },
  11: { label: '百度小程序', variant: 'secondary' },
  27: { label: '小程序', variant: 'success' },
}

/** 启用状态映射配置 */
export const bannerEnableStatusConfig: Record<BannerEnableStatus, { label: string, variant: 'default' | 'secondary' }> = {
  1: { label: '启用', variant: 'default' },
  2: { label: '禁用', variant: 'secondary' },
}

/** 列表查询参数(对接文档 3.4) */
export interface INeighborhoodBannerListQuery extends IPageParam {
  /** 关键词(模糊搜索) */
  keyword?: string
}

/** 居委会广告 VO(对接文档 3.4 TblAppEnterpriseBannerResp) */
export interface INeighborhoodBanner {
  /** 唯一标识 */
  uniqueCode: string
  /** 企业标识(后端注入) */
  orgCode?: string
  /** 位置:1=上部,2=中部,3=底部 */
  position: BannerPosition
  /** 名称 */
  name: string
  /** 图片 */
  poster: string
  /** 跳转类型:7=H5,8=专题,11=百度小程序,27=小程序 */
  type: BannerType
  /** 跳转标识 / H5 地址 */
  resCode?: string
  /** 投放开始时间 */
  startTime?: string
  /** 投放结束时间 */
  endTime?: string
  /** 排序 */
  torder?: number
  /** 1=启用,2=禁用 */
  isEnable?: BannerEnableStatus
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  updateTime?: string
}

/** 新增请求体(对接文档 3.4 OrgBannerAddReq) */
export interface INeighborhoodBannerAddDTO {
  /** 位置:1=上部,2=中部,3=底部 */
  position: BannerPosition
  /** 名称 */
  name: string
  /** 图片 */
  poster: string
  /** 跳转类型:7=H5,8=专题,11=百度小程序,27=小程序 */
  type: BannerType
  /** 跳转标识 / H5 地址 */
  resCode?: string
  /** 投放开始时间 */
  startTime?: string
  /** 投放结束时间 */
  endTime?: string
  /** 排序 */
  torder?: number
  /** 1=启用,2=禁用 */
  isEnable?: BannerEnableStatus
}

/** 更新请求体 = 新增 + uniqueCode */
export interface INeighborhoodBannerUpdateDTO extends INeighborhoodBannerAddDTO {
  /** 唯一标识 */
  uniqueCode: string
}

/** 分页列表响应 */
export type INeighborhoodBannerListResponse = IResponse<IPageResult<INeighborhoodBanner>>

/** 详情响应 */
export type INeighborhoodBannerDetailResponse = IResponse<INeighborhoodBanner>

// ==================== API 封装 ====================

/** 获取居委会广告分页列表 */
export function useGetBannerPageQuery(query: Ref<INeighborhoodBannerListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<INeighborhoodBannerListResponse, Error>({
    queryKey: ['neighborhoodBannerList', query],
    queryFn: async () => await apiFetch<INeighborhoodBannerListResponse>('/neighborhood/banner/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 获取居委会广告详情 */
export function useGetBannerDetailQuery(uniqueCode: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<INeighborhoodBannerDetailResponse, Error>({
    queryKey: ['neighborhoodBannerDetail', uniqueCode],
    queryFn: async () => await apiFetch<INeighborhoodBannerDetailResponse>('/neighborhood/banner/detail', {
      method: 'get',
      query: { uniqueCode: uniqueCode.value },
    }),
    // 默认仅 uniqueCode 有值即请求;组件层传 enabled 时需同时满足 id 有值(避免新建场景 /undefined)
    enabled: () => (enabled?.value ?? true) && !!uniqueCode.value,
    retry: false,
  })
}

/** 新增居委会广告 */
export function useCreateBannerMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, INeighborhoodBannerAddDTO>({
    mutationKey: ['createNeighborhoodBanner'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/neighborhood/banner', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodBannerList'] })
    },
  })
}

/** 更新居委会广告 */
export function useUpdateBannerMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, INeighborhoodBannerUpdateDTO>({
    mutationKey: ['updateNeighborhoodBanner'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/neighborhood/banner', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodBannerList'] })
      queryClient.invalidateQueries({ queryKey: ['neighborhoodBannerDetail'] })
    },
  })
}

/** 删除居委会广告 */
export function useDeleteBannerMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deleteNeighborhoodBanner'],
    mutationFn: async uniqueCode => await apiFetch<IResponse<boolean>>(`/neighborhood/banner/${uniqueCode}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodBannerList'] })
    },
  })
}
