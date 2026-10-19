import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IResponse } from '../types/response.type'
import type { HousekeeperEnableStatus } from './housekeeper.api'

/** 合作方人员。雪花 ID 保持字符串 */
export interface IPartnerStaff {
  staffId: string
  providerCode?: string
  staffName: string
  phone?: string
  avatar?: string
  serviceScope?: string
  serviceSkills?: string[]
  description?: string
  unitPrice?: number
  priceUnit?: string
  score?: number
  sortOrder?: number
  status?: HousekeeperEnableStatus
}

export interface IPartnerStaffSaveDTO {
  staffId?: string
  staffName: string
  phone?: string
  avatar?: string
  serviceScope?: string
  serviceSkills?: string[]
  description?: string
  unitPrice?: number
  priceUnit?: string
  score?: number
  sortOrder?: number
  status?: HousekeeperEnableStatus
}

function presentId(value: unknown) {
  if (value == null || value === '')
    return undefined
  const text = String(value).trim()
  return text || undefined
}

export function normalizePartnerStaff(raw: Partial<IPartnerStaff> | null | undefined): IPartnerStaff | undefined {
  const staffId = presentId(raw?.staffId)
  if (!raw || !staffId)
    return undefined
  const skills = Array.isArray(raw.serviceSkills)
    ? raw.serviceSkills.map(item => String(item).trim()).filter(Boolean)
    : undefined
  return {
    staffId,
    providerCode: presentId(raw.providerCode),
    staffName: raw.staffName?.trim() || '-',
    phone: raw.phone || undefined,
    avatar: raw.avatar || undefined,
    serviceScope: raw.serviceScope || undefined,
    serviceSkills: skills?.length ? skills : undefined,
    description: raw.description || undefined,
    unitPrice: raw.unitPrice ?? undefined,
    priceUnit: raw.priceUnit || undefined,
    score: raw.score ?? undefined,
    sortOrder: raw.sortOrder ?? undefined,
    status: raw.status,
  }
}

function normalizeStaffList(data: unknown) {
  const rows = Array.isArray(data) ? data : []
  return rows.map(item => normalizePartnerStaff(item)).filter((item): item is IPartnerStaff => !!item)
}

/** 站长查看某合作方渠道已启用人员 */
export function useGetFulfillProviderStaffQuery(providerCode: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IResponse<IPartnerStaff[]>, Error>({
    queryKey: ['fulfillProviderStaff', providerCode],
    queryFn: async () => {
      const res = await apiFetch<IResponse<unknown>>(`/housekeeper/fulfill/providers/${providerCode.value}/staff`)
      return { ...res, data: normalizeStaffList(res.data) }
    },
    enabled: () => (enabled?.value ?? true) && !!providerCode.value,
    retry: false,
  })
}

/** 合作方维护自己的人员，含禁用 */
export function useGetPartnerStaffQuery(enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IResponse<IPartnerStaff[]>, Error>({
    queryKey: ['partnerStaffList'],
    queryFn: async () => {
      const res = await apiFetch<IResponse<unknown>>('/housekeeper/partner/staff')
      return { ...res, data: normalizeStaffList(res.data) }
    },
    enabled: () => enabled?.value ?? true,
    retry: false,
  })
}

function invalidatePartnerStaff(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['partnerStaffList'] })
  queryClient.invalidateQueries({ queryKey: ['fulfillProviderStaff'] })
}

export function useCreatePartnerStaffMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IPartnerStaffSaveDTO>({
    mutationKey: ['createPartnerStaff'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/housekeeper/partner/staff', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => invalidatePartnerStaff(queryClient),
  })
}

export function useUpdatePartnerStaffMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IPartnerStaffSaveDTO>({
    mutationKey: ['updatePartnerStaff'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/housekeeper/partner/staff', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => invalidatePartnerStaff(queryClient),
  })
}

export function useUpdatePartnerStaffStatusMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, { staffId: string, status: HousekeeperEnableStatus }>({
    mutationKey: ['updatePartnerStaffStatus'],
    mutationFn: async ({ staffId, status }) => await apiFetch<IResponse<boolean>>(`/housekeeper/partner/staff/${staffId}/status`, {
      method: 'put',
      query: { status },
    }),
    onSuccess: () => invalidatePartnerStaff(queryClient),
  })
}

export function useDeletePartnerStaffMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deletePartnerStaff'],
    mutationFn: async staffId => await apiFetch<IResponse<boolean>>(`/housekeeper/partner/staff/${staffId}`, {
      method: 'delete',
    }),
    onSuccess: () => invalidatePartnerStaff(queryClient),
  })
}
