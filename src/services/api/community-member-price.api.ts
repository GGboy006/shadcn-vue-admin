import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

import { normalizeMemberPage, stringifyMemberId } from './community-member.page'

/** 套餐状态:1启用 / 2禁用 */
export type CommunityMemberPackageStatus = 1 | 2

export const communityMemberPackageStatusConfig: Record<CommunityMemberPackageStatus, { label: string, variant: 'default' | 'secondary' }> = {
  1: { label: '启用', variant: 'default' },
  2: { label: '禁用', variant: 'secondary' },
}

export const memberPackageStatusFilterOptions: { value: CommunityMemberPackageStatus, label: string }[] = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
]

/** 套餐分页(`GET /member/package/page`) */
export interface ICommunityMemberPackagePageQuery extends IPageParam {
  packageName?: string
  status?: CommunityMemberPackageStatus
}

/** 套餐 VO;雪花 ID 按 string 收 */
export interface ICommunityMemberPackage {
  packageId: string
  stationId?: string
  stationCode?: string
  stationRegionCode?: string
  packageName: string
  price: number
  effectiveDays: number
  iosProductId?: string
  sort?: number
  status?: CommunityMemberPackageStatus
  remark?: string
  createTime?: string
  updateTime?: string
}

/** 新增套餐:不要传 packageId / stationId / stationCode / stationRegionCode */
export interface ICommunityMemberPackageAddDTO {
  packageName: string
  price: number
  effectiveDays: number
  iosProductId?: string
  sort?: number
  status?: CommunityMemberPackageStatus
  remark?: string
}

export interface ICommunityMemberPackageUpdateDTO extends ICommunityMemberPackageAddDTO {
  packageId: string
}

export type ICommunityMemberPackagePageResponse = IResponse<IPageResult<ICommunityMemberPackage>>
export type ICommunityMemberPackageDetailResponse = IResponse<ICommunityMemberPackage>

export function normalizeMemberPackage(raw: ICommunityMemberPackage): ICommunityMemberPackage {
  return {
    ...raw,
    packageId: stringifyMemberId(raw.packageId) ?? '',
    stationId: stringifyMemberId(raw.stationId),
  }
}

export function useGetMemberPackagePageQuery(query: Ref<ICommunityMemberPackagePageQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ICommunityMemberPackagePageResponse, Error>({
    queryKey: ['communityMemberPackageList', query],
    queryFn: async () => {
      const res = await apiFetch<ICommunityMemberPackagePageResponse>('/member/package/page', {
        method: 'get',
        query: query.value,
      })
      return {
        ...res,
        data: normalizeMemberPage(res.data, normalizeMemberPackage),
      }
    },
    retry: false,
  })
}

export function useGetMemberPackageDetailQuery(packageId: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ICommunityMemberPackageDetailResponse, Error>({
    queryKey: ['communityMemberPackageDetail', packageId],
    queryFn: async () => {
      const res = await apiFetch<ICommunityMemberPackageDetailResponse>(`/member/package/${packageId.value}`, {
        method: 'get',
      })
      return {
        ...res,
        data: normalizeMemberPackage(res.data),
      }
    },
    enabled: () => (enabled?.value ?? true) && !!packageId.value,
    retry: false,
  })
}

export function useCreateMemberPackageMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, ICommunityMemberPackageAddDTO>({
    mutationKey: ['createCommunityMemberPackage'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/member/package', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityMemberPackageList'] })
    },
  })
}

export function useUpdateMemberPackageMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, ICommunityMemberPackageUpdateDTO>({
    mutationKey: ['updateCommunityMemberPackage'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/member/package', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityMemberPackageList'] })
      queryClient.invalidateQueries({ queryKey: ['communityMemberPackageDetail'] })
    },
  })
}

export function useDeleteMemberPackageMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deleteCommunityMemberPackage'],
    mutationFn: async packageId => await apiFetch<IResponse<boolean>>(`/member/package/${packageId}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityMemberPackageList'] })
      queryClient.invalidateQueries({ queryKey: ['communityMemberPackageDetail'] })
    },
  })
}
