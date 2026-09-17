import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type {
  IResidentDetailResponse,
  IResidentListQuery,
  IResidentListResponse,
  IResidentVerifyAuditDTO,
} from './resident.model'

import { normalizeMemberPage } from './community-member.page'
import { normalizeResident } from './resident.model'

export * from './resident.model'

export function useGetResidentPageQuery(query: Ref<IResidentListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IResidentListResponse, Error>({
    queryKey: ['residentList', query],
    queryFn: async () => {
      const res = await apiFetch<IResidentListResponse>('/resident/page', {
        method: 'get',
        query: query.value,
      })
      return {
        ...res,
        data: normalizeMemberPage(res.data, normalizeResident),
      }
    },
    retry: false,
  })
}

export function useGetResidentDetailQuery(residentId: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IResidentDetailResponse, Error>({
    queryKey: ['residentDetail', residentId],
    queryFn: async () => {
      const res = await apiFetch<IResidentDetailResponse>(`/resident/${residentId.value}`)
      return {
        ...res,
        data: normalizeResident(res.data),
      }
    },
    enabled: () => (enabled?.value ?? true) && !!residentId.value,
    retry: false,
  })
}

/** 仅认证中可审;驳回须填 remark */
export function useVerifyResidentMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResidentDetailResponse, Error, { residentId: string, body: IResidentVerifyAuditDTO }>({
    mutationKey: ['verifyResident'],
    mutationFn: async ({ residentId, body }) => {
      const res = await apiFetch<IResidentDetailResponse>(`/resident/${residentId}/verify`, {
        method: 'put',
        body,
      })
      return {
        ...res,
        data: normalizeResident(res.data),
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residentList'] })
      queryClient.invalidateQueries({ queryKey: ['residentDetail'] })
    },
  })
}
