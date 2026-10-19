import { useQuery } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IResponse } from '../types/response.type'

import { normalizeCapability, normalizeCapabilityList } from './capability.list'

/** 接入方式:1 MCP / 2 Skill / 3 智能体 / 4 小程序 / 5 H5 / 6 应用内页 / 7 外部应用 */
export type CapabilityAccessType = 1 | 2 | 3 | 4 | 5 | 6 | 7

/** Web 启用项 VO(对接文档 §9 / §11,无 remark/status) */
export interface ICapability {
  capabilityId: string
  capabilityCode: string
  capabilityName: string
  accessType: CapabilityAccessType
  provider?: string
  category: string
  icon?: string | null
  description?: string
  tags?: string[]
  samplePrompts?: string[]
  sortOrder?: number
}

/** Web 启用列表查询(对接文档 §9,`GET /capability/list`) */
export interface ICapabilityListQuery {
  accessType?: CapabilityAccessType
  category?: string
}

export type ICapabilityListResponse = IResponse<ICapability[]>
export type ICapabilityDetailResponse = IResponse<ICapability>

/** 启用列表,只出 status=1,响应为数组不是分页 */
export function useGetCapabilityListQuery(query: Ref<ICapabilityListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ICapabilityListResponse, Error>({
    queryKey: ['capabilityList', query],
    queryFn: async () => {
      const res = await apiFetch<ICapabilityListResponse>('/capability/list', {
        method: 'get',
        query: query.value,
      })
      return {
        ...res,
        data: normalizeCapabilityList(res.data),
      }
    },
    retry: false,
  })
}

/** 启用详情;禁用或不存在时报「能力不存在」 */
export function useGetCapabilityDetailQuery(capabilityId: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ICapabilityDetailResponse, Error>({
    queryKey: ['capabilityDetail', capabilityId],
    queryFn: async () => {
      const res = await apiFetch<ICapabilityDetailResponse>(`/capability/${capabilityId.value}`)
      return {
        ...res,
        data: normalizeCapability(res.data),
      }
    },
    enabled: () => (enabled?.value ?? true) && capabilityId.value !== undefined,
    retry: false,
  })
}
