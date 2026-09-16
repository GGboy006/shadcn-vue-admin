import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

import { normalizeMemberPage } from './community-member.page'

/** 启用状态:1启用 / 2禁用(对接文档 §7) */
export type CommunityMemberPriceEnableStatus = 1 | 2

export const communityMemberPriceEnableConfig: Record<CommunityMemberPriceEnableStatus, { label: string, variant: 'default' | 'secondary' }> = {
  1: { label: '启用', variant: 'default' },
  2: { label: '禁用', variant: 'secondary' },
}

/** 套餐分页查询(对接文档 §5.1,`GET /community/memberPrice/page`) */
export interface ICommunityMemberPricePageQuery extends IPageParam {
  /** 按套餐名称模糊 */
  keyword?: string
}

/** 套餐 VO(对接文档 §5.7) */
export interface ICommunityMemberPrice {
  /** 主键,雪花按 string 收 */
  id?: string
  /** 套餐标识(C 端下单用) */
  uniqueCode: string
  /** 套餐名称 */
  priceName: string
  /** 售价,可为 0 */
  price: number
  /** 有效天数 */
  effectiveDays: number
  /** 社区/小区编号(接口写入) */
  regionCode?: string
  /** 小区合伙人标识 = 站长 stationCode */
  businessCode?: string
  /** 城市合伙人 id,展示即可 */
  partnerId?: string
  /** 1启用 / 2禁用 */
  isEnable?: CommunityMemberPriceEnableStatus
  /** 排序,升序 */
  sortOrder?: number
  /** 备注 */
  remark?: string
  createTime?: string
  updateTime?: string
}

/** 新增套餐(不要传 partnerId / regionCode) */
export interface ICommunityMemberPriceAddDTO {
  priceName: string
  price: number
  effectiveDays: number
  remark?: string
  isEnable?: CommunityMemberPriceEnableStatus
  sortOrder?: number
}

/** 更新套餐 = 新增 + uniqueCode */
export interface ICommunityMemberPriceUpdateDTO extends ICommunityMemberPriceAddDTO {
  uniqueCode: string
}

export type ICommunityMemberPricePageResponse = IResponse<IPageResult<ICommunityMemberPrice>>
export type ICommunityMemberPriceDetailResponse = IResponse<ICommunityMemberPrice>

export function normalizeMemberPrice(raw: ICommunityMemberPrice): ICommunityMemberPrice {
  return {
    ...raw,
    uniqueCode: String(raw.uniqueCode),
    id: raw.id == null ? undefined : String(raw.id),
  }
}

/** 套餐分页,只出本站 */
export function useGetMemberPricePageQuery(query: Ref<ICommunityMemberPricePageQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ICommunityMemberPricePageResponse, Error>({
    queryKey: ['communityMemberPriceList', query],
    queryFn: async () => {
      const res = await apiFetch<ICommunityMemberPricePageResponse>('/community/memberPrice/page', {
        method: 'get',
        query: query.value,
      })
      return {
        ...res,
        data: normalizeMemberPage(res.data, normalizeMemberPrice),
      }
    },
    retry: false,
  })
}

/** 套餐详情 */
export function useGetMemberPriceDetailQuery(uniqueCode: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ICommunityMemberPriceDetailResponse, Error>({
    queryKey: ['communityMemberPriceDetail', uniqueCode],
    queryFn: async () => {
      const res = await apiFetch<ICommunityMemberPriceDetailResponse>('/community/memberPrice/detail', {
        method: 'get',
        query: { uniqueCode: uniqueCode.value },
      })
      return {
        ...res,
        data: normalizeMemberPrice(res.data),
      }
    },
    enabled: () => (enabled?.value ?? true) && !!uniqueCode.value,
    retry: false,
  })
}

export function useCreateMemberPriceMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, ICommunityMemberPriceAddDTO>({
    mutationKey: ['createCommunityMemberPrice'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/community/memberPrice', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityMemberPriceList'] })
    },
  })
}

export function useUpdateMemberPriceMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, ICommunityMemberPriceUpdateDTO>({
    mutationKey: ['updateCommunityMemberPrice'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/community/memberPrice', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityMemberPriceList'] })
      queryClient.invalidateQueries({ queryKey: ['communityMemberPriceDetail'] })
    },
  })
}

export function useDeleteMemberPriceMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deleteCommunityMemberPrice'],
    mutationFn: async uniqueCode => await apiFetch<IResponse<boolean>>(`/community/memberPrice/${uniqueCode}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityMemberPriceList'] })
      queryClient.invalidateQueries({ queryKey: ['communityMemberPriceDetail'] })
    },
  })
}
