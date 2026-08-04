import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

// ==================== 类型 ====================

/** 是否收费:1=收费,2=免费 */
export type ActivityChargeStatus = 1 | 2
/** 审核状态:0=待审核,1=通过,2=未通过 */
export type ActivityAuditStatus = 0 | 1 | 2
/** 启用状态:1=启用,2=禁用 */
export type ActivityEnableStatus = 1 | 2
/** 是否推荐:1=是,2=否 */
export type ActivityRecommendStatus = 1 | 2

/** 审核状态映射配置 */
export const activityAuditStatusConfig: Record<ActivityAuditStatus, { label: string, variant: 'warning' | 'success' | 'destructive' }> = {
  0: { label: '待审核', variant: 'warning' },
  1: { label: '通过', variant: 'success' },
  2: { label: '未通过', variant: 'destructive' },
}

/** 启用状态映射配置 */
export const activityEnableStatusConfig: Record<ActivityEnableStatus, { label: string, variant: 'default' | 'secondary' }> = {
  1: { label: '启用', variant: 'default' },
  2: { label: '禁用', variant: 'secondary' },
}

/** 是否推荐映射配置 */
export const activityRecommendConfig: Record<ActivityRecommendStatus, { label: string, variant: 'default' | 'secondary' }> = {
  1: { label: '推荐', variant: 'default' },
  2: { label: '普通', variant: 'secondary' },
}

/** 列表查询参数(对接文档 3.3) */
export interface INeighborhoodActivityListQuery extends IPageParam {
  /** 关键词(模糊搜索) */
  keyword?: string
}

/** 居委会活动 VO(对接文档 3.3 TblAppEnterpriseActivityResp) */
export interface INeighborhoodActivity {
  /** 唯一标识 */
  uniqueCode: string
  /** 名称 */
  name: string
  /** 封面图 */
  poster?: string
  /** 详情图 */
  detailPoster?: string
  /** 主办单位 */
  sponsorName?: string
  /** 分类标识 */
  cateCode?: string
  /** 分类名称 */
  cateName?: string
  /** 简介 */
  describes?: string
  /** 富文本内容 */
  content?: string
  /** 地址 */
  address?: string
  /** 是否收费:1=收费,2=免费 */
  isCharge?: ActivityChargeStatus
  /** 金额 */
  salePrice?: number
  /** 开始时间 */
  startTime?: string
  /** 结束时间 */
  endTime?: string
  /** 审核状态:0=待审核,1=通过,2=未通过 */
  status?: ActivityAuditStatus
  /** 排序 */
  torder?: number
  /** 是否推荐:1=是,2=否 */
  isRecommend?: ActivityRecommendStatus
  /** 1=启用,2=禁用 */
  isEnable?: ActivityEnableStatus
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  updateTime?: string
}

/** 新增请求体(对接文档 3.3 OrgActivityAddReq) */
export interface INeighborhoodActivityAddDTO {
  /** 名称 */
  name: string
  /** 封面图 */
  poster: string
  /** 开始时间 */
  startTime: string
  /** 结束时间 */
  endTime: string
  /** 详情图 */
  detailPoster?: string
  /** 主办单位 */
  sponsorName?: string
  /** 活动分类 code */
  cateCode?: string
  /** 分类名称 */
  cateName?: string
  /** 简介 */
  describes?: string
  /** 富文本 */
  content?: string
  /** 地址 */
  address?: string
  /** 是否收费:1=收费,2=免费 */
  isCharge?: ActivityChargeStatus
  /** 金额 */
  salePrice?: number
  /** 审核状态 */
  status?: ActivityAuditStatus
  /** 排序 */
  torder?: number
  /** 是否推荐 */
  isRecommend?: ActivityRecommendStatus
  /** 启用状态 */
  isEnable?: ActivityEnableStatus
}

/** 更新请求体 = 新增 + uniqueCode */
export interface INeighborhoodActivityUpdateDTO extends INeighborhoodActivityAddDTO {
  /** 唯一标识 */
  uniqueCode: string
}

/** 分页列表响应 */
export type INeighborhoodActivityListResponse = IResponse<IPageResult<INeighborhoodActivity>>

/** 详情响应 */
export type INeighborhoodActivityDetailResponse = IResponse<INeighborhoodActivity>

// ==================== API 封装 ====================

/** 获取居委会活动分页列表 */
export function useGetActivityPageQuery(query: Ref<INeighborhoodActivityListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<INeighborhoodActivityListResponse, Error>({
    queryKey: ['neighborhoodActivityList', query],
    queryFn: async () => await apiFetch<INeighborhoodActivityListResponse>('/neighborhood/activity/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 获取居委会活动详情 */
export function useGetActivityDetailQuery(uniqueCode: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<INeighborhoodActivityDetailResponse, Error>({
    queryKey: ['neighborhoodActivityDetail', uniqueCode],
    queryFn: async () => await apiFetch<INeighborhoodActivityDetailResponse>('/neighborhood/activity/detail', {
      method: 'get',
      query: { uniqueCode: uniqueCode.value },
    }),
    // 默认仅 uniqueCode 有值即请求;组件层可传入更严格的 enabled(如弹层打开才请求),
    // 此时仍需 uniqueCode 有值(组件传 isOpen 时,新建场景 uniqueCode 为空,必须由 &&!!code 拦住避免 /detail?uniqueCode=undefined)。
    enabled: () => (enabled?.value ?? true) && !!uniqueCode.value,
    retry: false,
  })
}

/** 新增居委会活动 */
export function useCreateActivityMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, INeighborhoodActivityAddDTO>({
    mutationKey: ['createNeighborhoodActivity'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/neighborhood/activity', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodActivityList'] })
    },
  })
}

/** 更新居委会活动 */
export function useUpdateActivityMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, INeighborhoodActivityUpdateDTO>({
    mutationKey: ['updateNeighborhoodActivity'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/neighborhood/activity', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodActivityList'] })
      queryClient.invalidateQueries({ queryKey: ['neighborhoodActivityDetail'] })
    },
  })
}

/** 删除居委会活动 */
export function useDeleteActivityMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deleteNeighborhoodActivity'],
    mutationFn: async uniqueCode => await apiFetch<IResponse<boolean>>(`/neighborhood/activity/${uniqueCode}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodActivityList'] })
    },
  })
}
