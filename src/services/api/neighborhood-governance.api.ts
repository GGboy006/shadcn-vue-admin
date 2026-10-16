import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IResponse } from '../types/response.type'

export type EnableStatus = 1 | 2

export interface VillageStat {
  statId: string
  statCode: string
  statName: string
  statValue: string | null
  unit: string | null
  icon: string | null
  status: EnableStatus
  statusLabel: string
  sortOrder: number
}

export interface VillageStatSave {
  statId?: string
  statName: string
  statValue?: string
  unit?: string
  icon?: string
  status?: EnableStatus
  sortOrder?: number
}

export interface VillageMember {
  memberId: string
  name: string
  title: string
  phone: string | null
  avatar: string | null
  description: string | null
  status: EnableStatus
  statusLabel: string
  sortOrder: number
}

export interface VillageMemberSave {
  memberId?: string
  name: string
  title: string
  phone?: string
  avatar?: string
  description?: string
  status?: EnableStatus
  sortOrder?: number
}

export type OpenContentType = 1 | 2 | 3 | 4 | 5

export interface OpenContent {
  openId: string | null
  type: OpenContentType
  typeLabel: string
  content: string | null
}

export interface FinanceLedger {
  financeId: string
  month: string
  income: number
  expense: number
  balance: number
  content: string | null
  status: EnableStatus
  statusLabel: string
  createTime: string
}

export interface FinanceSave {
  financeId?: string
  month: string
  income: number
  expense: number
  content?: string
  status?: EnableStatus
}

export type Gender = 1 | 2
export type PublicityType = 1 | 2 | 3
export type PublicityStatus = 1 | 2

export interface PartyPublicity {
  publicityId: string
  name: string
  gender: Gender | null
  genderLabel: string | null
  age: number | null
  avatar: string | null
  type: PublicityType | null
  typeLabel: string | null
  signDate: string | null
  startTime: string | null
  endTime: string | null
  content: string | null
  status: PublicityStatus
  statusLabel: string
  remainDays: number | null
}

export interface PartyPublicitySave {
  publicityId?: string
  name: string
  gender?: Gender
  age?: number
  avatar?: string
  type?: PublicityType
  signDate?: string
  startTime?: string
  endTime?: string
  content?: string
  status?: PublicityStatus
}

export type MeetingType = 1 | 2 | 3 | 4
export type MeetingStatus = 1 | 2

export interface PartyMeeting {
  meetingId: string
  type: MeetingType
  typeLabel: string
  name: string
  startTime: string | null
  address: string | null
  content: string | null
  describes: string | null
  status: MeetingStatus
  statusLabel: string
}

export interface PartyMeetingSave {
  meetingId?: string
  type: MeetingType
  name: string
  startTime?: string
  address?: string
  content?: string
  describes?: string
  status?: MeetingStatus
}

export interface PartyFee {
  feeId: string
  name: string
  shouldCount: number
  paidCount: number
  feeRate: number
  salePrice: number
  status: EnableStatus
  statusLabel: string
}

export interface PartyFeeSave {
  feeId?: string
  name: string
  shouldCount: number
  paidCount: number
  salePrice: number
  status?: EnableStatus
}

export type PartyActivityStatus = 1 | 2 | 3

export interface PartyActivity {
  activityId: string
  name: string
  describes: string | null
  status: PartyActivityStatus
  statusLabel: string
  sortOrder: number
}

export interface PartyActivitySave {
  activityId?: string
  name: string
  describes?: string
  status?: PartyActivityStatus
  sortOrder?: number
}

export interface PartySummary {
  partyMemberCount: number
  committeeCount: number
  publishingCount: number
  monthMeetingCount: number
  feeRate: number
}

const summaryKey = 'neighborhoodPartySummary'

function useListQuery<T>(queryKey: string, path: string) {
  const { apiFetch } = useApiFetch()
  return useQuery<IResponse<T[]>, Error>({
    queryKey: [queryKey],
    queryFn: async () => await apiFetch<IResponse<T[]>>(path, { method: 'get' }),
    retry: false,
  })
}

function useRecordMutation<T>(mutationKey: string, path: string, method: 'post' | 'put', queryKeys: string[]) {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()
  return useMutation<IResponse<boolean>, Error, T>({
    mutationKey: [mutationKey],
    mutationFn: async data => await apiFetch<IResponse<boolean>>(path, {
      method,
      body: data as Record<string, unknown>,
    }),
    onSuccess: () => {
      for (const key of queryKeys)
        queryClient.invalidateQueries({ queryKey: [key] })
    },
  })
}

function useDeleteMutation(mutationKey: string, path: (id: string) => string, queryKeys: string[]) {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()
  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: [mutationKey],
    mutationFn: async id => await apiFetch<IResponse<boolean>>(path(id), { method: 'delete' }),
    onSuccess: () => {
      for (const key of queryKeys)
        queryClient.invalidateQueries({ queryKey: [key] })
    },
  })
}

function useStatusMutation(mutationKey: string, path: (id: string) => string, queryKeys: string[]) {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()
  return useMutation<IResponse<boolean>, Error, { id: string, status: EnableStatus }>({
    mutationKey: [mutationKey],
    mutationFn: async ({ id, status }) => await apiFetch<IResponse<boolean>>(path(id), {
      method: 'put',
      query: { status },
    }),
    onSuccess: () => {
      for (const key of queryKeys)
        queryClient.invalidateQueries({ queryKey: [key] })
    },
  })
}

const statKey = 'neighborhoodStatList'
const memberKey = 'neighborhoodMemberList'
const openKey = 'neighborhoodOpenList'
const financeKey = 'neighborhoodFinanceList'
const publicityKey = 'neighborhoodPublicityList'
const meetingKey = 'neighborhoodMeetingList'
const feeKey = 'neighborhoodFeeList'
const activityKey = 'neighborhoodPartyActivityList'

export function useGetStatListQuery() {
  return useListQuery<VillageStat>(statKey, '/neighborhood/stat/list')
}

export function useCreateStatMutation() {
  return useRecordMutation<VillageStatSave>('createNeighborhoodStat', '/neighborhood/stat', 'post', [statKey, summaryKey])
}

export function useUpdateStatMutation() {
  return useRecordMutation<VillageStatSave>('updateNeighborhoodStat', '/neighborhood/stat', 'put', [statKey, summaryKey])
}

export function useUpdateStatStatusMutation() {
  return useStatusMutation('updateNeighborhoodStatStatus', id => `/neighborhood/stat/${id}/status`, [statKey, summaryKey])
}

export function useDeleteStatMutation() {
  return useDeleteMutation('deleteNeighborhoodStat', id => `/neighborhood/stat/${id}`, [statKey, summaryKey])
}

export function useGetMemberListQuery() {
  return useListQuery<VillageMember>(memberKey, '/neighborhood/member/list')
}

export function useCreateMemberMutation() {
  return useRecordMutation<VillageMemberSave>('createNeighborhoodMember', '/neighborhood/member', 'post', [memberKey, summaryKey])
}

export function useUpdateMemberMutation() {
  return useRecordMutation<VillageMemberSave>('updateNeighborhoodMember', '/neighborhood/member', 'put', [memberKey, summaryKey])
}

export function useUpdateMemberStatusMutation() {
  return useStatusMutation('updateNeighborhoodMemberStatus', id => `/neighborhood/member/${id}/status`, [memberKey, summaryKey])
}

export function useDeleteMemberMutation() {
  return useDeleteMutation('deleteNeighborhoodMember', id => `/neighborhood/member/${id}`, [memberKey, summaryKey])
}

export function useGetOpenListQuery() {
  return useListQuery<OpenContent>(openKey, '/neighborhood/open/list')
}

export function useUpdateOpenMutation() {
  return useRecordMutation<{ type: OpenContentType, content?: string }>('updateNeighborhoodOpen', '/neighborhood/open', 'put', [openKey])
}

export function useGetFinanceListQuery() {
  return useListQuery<FinanceLedger>(financeKey, '/neighborhood/finance/list')
}

export function useCreateFinanceMutation() {
  return useRecordMutation<FinanceSave>('createNeighborhoodFinance', '/neighborhood/finance', 'post', [financeKey])
}

export function useUpdateFinanceMutation() {
  return useRecordMutation<FinanceSave>('updateNeighborhoodFinance', '/neighborhood/finance', 'put', [financeKey])
}

export function useDeleteFinanceMutation() {
  return useDeleteMutation('deleteNeighborhoodFinance', id => `/neighborhood/finance/${id}`, [financeKey])
}

export function useGetPublicityListQuery() {
  return useListQuery<PartyPublicity>(publicityKey, '/neighborhood/publicity/list')
}

export function useCreatePublicityMutation() {
  return useRecordMutation<PartyPublicitySave>('createNeighborhoodPublicity', '/neighborhood/publicity', 'post', [publicityKey, summaryKey])
}

export function useUpdatePublicityMutation() {
  return useRecordMutation<PartyPublicitySave>('updateNeighborhoodPublicity', '/neighborhood/publicity', 'put', [publicityKey, summaryKey])
}

export function useDeletePublicityMutation() {
  return useDeleteMutation('deleteNeighborhoodPublicity', id => `/neighborhood/publicity/${id}`, [publicityKey, summaryKey])
}

export function useGetMeetingListQuery() {
  return useListQuery<PartyMeeting>(meetingKey, '/neighborhood/meeting/list')
}

export function useCreateMeetingMutation() {
  return useRecordMutation<PartyMeetingSave>('createNeighborhoodMeeting', '/neighborhood/meeting', 'post', [meetingKey, summaryKey])
}

export function useUpdateMeetingMutation() {
  return useRecordMutation<PartyMeetingSave>('updateNeighborhoodMeeting', '/neighborhood/meeting', 'put', [meetingKey, summaryKey])
}

export function useDeleteMeetingMutation() {
  return useDeleteMutation('deleteNeighborhoodMeeting', id => `/neighborhood/meeting/${id}`, [meetingKey, summaryKey])
}

export function useGetFeeListQuery() {
  return useListQuery<PartyFee>(feeKey, '/neighborhood/fee/list')
}

export function useCreateFeeMutation() {
  return useRecordMutation<PartyFeeSave>('createNeighborhoodFee', '/neighborhood/fee', 'post', [feeKey, summaryKey])
}

export function useUpdateFeeMutation() {
  return useRecordMutation<PartyFeeSave>('updateNeighborhoodFee', '/neighborhood/fee', 'put', [feeKey, summaryKey])
}

export function useDeleteFeeMutation() {
  return useDeleteMutation('deleteNeighborhoodFee', id => `/neighborhood/fee/${id}`, [feeKey, summaryKey])
}

export function useGetPartyActivityListQuery() {
  return useListQuery<PartyActivity>(activityKey, '/neighborhood/party-activity/list')
}

export function useCreatePartyActivityMutation() {
  return useRecordMutation<PartyActivitySave>('createNeighborhoodPartyActivity', '/neighborhood/party-activity', 'post', [activityKey])
}

export function useUpdatePartyActivityMutation() {
  return useRecordMutation<PartyActivitySave>('updateNeighborhoodPartyActivity', '/neighborhood/party-activity', 'put', [activityKey])
}

export function useDeletePartyActivityMutation() {
  return useDeleteMutation('deleteNeighborhoodPartyActivity', id => `/neighborhood/party-activity/${id}`, [activityKey])
}

export function useGetPartySummaryQuery() {
  const { apiFetch } = useApiFetch()
  return useQuery<IResponse<PartySummary>, Error>({
    queryKey: [summaryKey],
    queryFn: async () => await apiFetch<IResponse<PartySummary>>('/neighborhood/party/summary', { method: 'get' }),
    retry: false,
  })
}
