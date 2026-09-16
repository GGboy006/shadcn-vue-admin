import { useQuery } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type {
  ICommunityMemberOrderDetailResponse,
  ICommunityMemberOrderPageQuery,
  ICommunityMemberOrderPageResponse,
} from './community-member-order.model'

import {
  normalizeMemberOrder,
} from './community-member-order.model'
import { normalizeMemberPage } from './community-member.page'

export * from './community-member-order.model'

/** 本站会员订单分页,只读 */
export function useGetMemberOrderPageQuery(query: Ref<ICommunityMemberOrderPageQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ICommunityMemberOrderPageResponse, Error>({
    queryKey: ['communityMemberOrderList', query],
    queryFn: async () => {
      const res = await apiFetch<ICommunityMemberOrderPageResponse>('/community/memberOrder/page', {
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

/** 订单详情;uniqueCode 或商户订单号 orderid 均可 */
export function useGetMemberOrderDetailQuery(uniqueCode: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ICommunityMemberOrderDetailResponse, Error>({
    queryKey: ['communityMemberOrderDetail', uniqueCode],
    queryFn: async () => {
      const res = await apiFetch<ICommunityMemberOrderDetailResponse>('/community/memberOrder/detail', {
        method: 'get',
        query: { uniqueCode: uniqueCode.value },
      })
      return {
        ...res,
        data: normalizeMemberOrder(res.data),
      }
    },
    enabled: () => (enabled?.value ?? true) && !!uniqueCode.value,
    retry: false,
  })
}
