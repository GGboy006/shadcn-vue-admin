import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IResponse } from '../types/response.type'
import type {
  ICommunityMemberOrderDetailResponse,
  ICommunityMemberOrderPageQuery,
  ICommunityMemberOrderPageResponse,
} from './community-member-order.model'

import { normalizeMemberOrder } from './community-member-order.model'
import { normalizeMemberPage } from './community-member.page'

export * from './community-member-order.model'

export function useGetMemberOrderPageQuery(query: Ref<ICommunityMemberOrderPageQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ICommunityMemberOrderPageResponse, Error>({
    queryKey: ['communityMemberOrderList', query],
    queryFn: async () => {
      const res = await apiFetch<ICommunityMemberOrderPageResponse>('/member/order/page', {
        method: 'get',
        query: query.value,
      })
      return {
        ...res,
        data: normalizeMemberPage(res.data, normalizeMemberOrder),
      }
    },
    retry: false,
  })
}

export function useGetMemberOrderDetailQuery(orderId: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ICommunityMemberOrderDetailResponse, Error>({
    queryKey: ['communityMemberOrderDetail', orderId],
    queryFn: async () => {
      const res = await apiFetch<ICommunityMemberOrderDetailResponse>(`/member/order/${orderId.value}`, {
        method: 'get',
      })
      return {
        ...res,
        data: normalizeMemberOrder(res.data),
      }
    },
    enabled: () => (enabled?.value ?? true) && !!orderId.value,
    retry: false,
  })
}

/** 仅待支付可取消,无 Body */
export function useCancelMemberOrderMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['cancelCommunityMemberOrder'],
    mutationFn: async orderId => await apiFetch<IResponse<boolean>>(`/member/order/${orderId}/cancel`, {
      method: 'put',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityMemberOrderList'] })
      queryClient.invalidateQueries({ queryKey: ['communityMemberOrderDetail'] })
    },
  })
}
