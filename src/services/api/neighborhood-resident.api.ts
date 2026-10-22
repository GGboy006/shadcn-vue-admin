import type { MaybeRefOrGetter } from 'vue'

import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, toValue } from 'vue'

import { useApiFetch } from '@/composables/use-fetch'

import type { IResponse } from '../types/response.type'

export type RepairType = 1 | 2 | 3 | 4 | 5 | 6
export type RepairStatus = 1 | 2 | 3
export type RepairLogStatus = 1 | 2

export interface RepairLog {
  logId: string
  content: string
  status: RepairLogStatus
  statusLabel: string
  createTime: string
}

export interface RepairOrder {
  repairId: string
  code: string
  type: RepairType
  typeLabel: string
  name: string | null
  userName: string | null
  userPhone: string | null
  address: string | null
  poster: string | null
  content: string
  contactName: string | null
  status: RepairStatus
  statusLabel: string
  createTime: string
  logs: RepairLog[] | null
}

export interface RepairSave {
  repairId?: string
  type: RepairType
  content: string
  name?: string
  userName?: string
  userPhone?: string
  address?: string
  poster?: string
  contactName?: string
  status?: RepairStatus
}

export interface RepairProgressSave {
  repairId: string
  content: string
  status?: RepairLogStatus
  finish?: 1 | 2
}

export type AffairType = 1 | 2 | 3 | 4 | 5
export type AffairStatus = 1 | 2 | 3 | 4 | 5 | 6

export interface AffairOption {
  type: number
  name: string
  votes: number
}

export interface Affair {
  affairId: string
  name: string
  type: AffairType
  typeLabel: string
  content: string | null
  userName: string | null
  userPhone: string | null
  endTime: string | null
  status: AffairStatus
  statusLabel: string
  supportCount: number | null
  commentCount: number | null
  replyContent: string | null
  createTime: string
  options: AffairOption[] | null
}

export interface AffairSave {
  affairId?: string
  name: string
  type: AffairType
  content?: string
  userName?: string
  userPhone?: string
  endTime?: string
  options?: string[]
  status?: AffairStatus
  replyContent?: string
}

export type MailShowStatus = 1 | 2
export type MailStatus = 1 | 2 | 3

export interface MailMessage {
  mailId: string
  code: string
  name: string | null
  userName: string | null
  userPhone: string | null
  content: string | null
  showStatus: MailShowStatus
  showStatusLabel: string
  status: MailStatus
  statusLabel: string
  replyContent: string | null
  replyTime: string | null
  createTime: string
}

export interface MailReplySave {
  mailId: string
  replyContent: string
  showStatus?: MailShowStatus
  status?: 2 | 3
}

export type PointRuleType = 1 | 2 | 3 | 4

export interface PointRule {
  ruleId: string
  name: string
  type: PointRuleType
  typeLabel: string
  points: number
  status: 1 | 2
  statusLabel: string
  sortOrder: number
}

export interface PointRuleSave {
  ruleId?: string
  name: string
  type: PointRuleType
  points: number
  status?: 1 | 2
  sortOrder?: number
}

export interface PointAccount {
  accountId: string
  userId: string
  userName: string | null
  address: string | null
  balance: number
  earned: number
  spent: number
  updateTime: string | null
}

export interface PointAdjustSave {
  userId: string
  points: number
  remark?: string
}

export interface PointGoods {
  goodsId: string
  name: string
  poster: string | null
  points: number
  stock: number | null
  status: 1 | 2
  statusLabel: string
  sortOrder: number
}

export interface PointGoodsSave {
  goodsId?: string
  name: string
  poster?: string
  points: number
  stock?: number
  status?: 1 | 2
  sortOrder?: number
}

export interface PointExchange {
  exchangeId: string
  userId: string
  userName: string | null
  goodsId: string
  name: string | null
  points: number
  status: 1 | 2
  statusLabel: string
  createTime: string
}

export interface PointExchangeSave {
  userId: string
  goodsId: string
}

export type VolunteerStatus = 1 | 2 | 3 | 4

export interface VolunteerLog {
  logId: string
  name: string
  signDate: string
  hours: number
}

export interface Volunteer {
  volunteerId: string
  userId: string | null
  userName: string
  userPhone: string | null
  intro: string | null
  businessHours: string | null
  hours: number | null
  status: VolunteerStatus
  statusLabel: string
  createTime: string
  logs: VolunteerLog[] | null
}

export interface VolunteerSave {
  volunteerId?: string
  userId?: string
  userName: string
  userPhone?: string
  intro?: string
  businessHours?: string
  status?: 2 | 4
}

export interface VolunteerLogSave {
  volunteerId: string
  name: string
  signDate: string
  hours: number
}

export interface Mediator {
  mediatorId: string
  name: string
  title: string | null
  phone: string | null
  intro: string | null
  status: 1 | 2
  statusLabel: string
  sortOrder: number
}

export interface MediatorSave {
  mediatorId?: string
  name: string
  title?: string
  phone?: string
  intro?: string
  status?: 1 | 2
  sortOrder?: number
}

export type MediateType = 1 | 2 | 3 | 4 | 5
export type MediateStatus = 1 | 2 | 3 | 4

export interface MediateCase {
  mediateId: string
  userName: string
  userPhone: string | null
  type: MediateType
  typeLabel: string
  content: string
  mediatorId: string | null
  contactName: string | null
  status: MediateStatus
  statusLabel: string
  createTime: string
}

export interface MediateSave {
  mediateId?: string
  userName: string
  userPhone?: string
  type: MediateType
  content: string
  status?: MediateStatus
}

export interface MediateAcceptSave {
  mediateId: string
  mediatorId: string
}

export interface ElderMeal {
  mealId: string | null
  salePrice: number | null
  businessHours: string | null
  address: string | null
  shouldCount: number | null
  content: string | null
}

export interface ElderMealSave {
  salePrice?: number
  businessHours?: string
  address?: string
  shouldCount?: number
  content?: string
}

export interface ElderPerson {
  personId: string
  name: string
  age: number | null
  signDate: string | null
  status: 1 | 2
  statusLabel: string
}

export interface ElderPersonSave {
  personId?: string
  name: string
  age?: number
  signDate?: string
  status?: 1 | 2
}

export interface ElderAllowance {
  allowanceId: string
  name: string
  salePrice: number
  shouldCount: number | null
  sortOrder: number | null
}

export interface ElderAllowanceSave {
  allowanceId?: string
  name: string
  salePrice: number
  shouldCount?: number
  sortOrder?: number
}

export interface ElderVisitor {
  visitorId: string
  name: string
  phone: string | null
  remark: string | null
  sortOrder: number | null
}

export interface ElderVisitorSave {
  visitorId?: string
  name: string
  phone?: string
  remark?: string
  sortOrder?: number
}

export type VisitFrequency = 1 | 2 | 3 | 4

export interface ElderVisit {
  visitId: string
  name: string
  age: number | null
  address: string | null
  contactName: string | null
  type: VisitFrequency
  typeLabel: string
  signDate: string | null
  status: 1 | 2
  statusLabel: string
}

export interface ElderVisitSave {
  visitId?: string
  name: string
  age?: number
  address?: string
  contactName?: string
  type: VisitFrequency
  signDate?: string
  status?: 1 | 2
}

export interface HealthRecord {
  healthId: string
  userId: string | null
  code: string | null
  userName: string
  gender: 1 | 2 | null
  genderLabel: string | null
  age: number | null
  height: number | null
  weight: number | null
  bloodPressure: string | null
  bloodSugar: string | null
  signDate: string | null
  intro: string | null
  status: 1 | 2
  statusLabel: string
}

export interface HealthRecordSave {
  healthId?: string
  userId?: string
  code?: string
  userName: string
  gender?: 1 | 2
  age?: number
  height?: number
  weight?: number
  bloodPressure?: string
  bloodSugar?: string
  signDate?: string
  intro?: string
  status?: 1 | 2
}

export interface HealthSign {
  signId: string
  userId: string | null
  userName: string
  userPhone: string | null
  contactName: string | null
  title: string | null
  intro: string | null
  signDate: string | null
  endTime: string | null
  status: 1 | 2 | 3
  statusLabel: string
}

export interface HealthSignSave {
  signId?: string
  userId?: string
  userName: string
  userPhone?: string
  contactName?: string
  title?: string
  intro?: string
  signDate?: string
  endTime?: string
  status?: 1 | 2 | 3
}

export interface HealthBook {
  bookId: string | null
  type: 1 | 2 | null
  typeLabel: string | null
  status: 1 | 2 | null
  statusLabel: string | null
  externalUrl: string | null
  remark: string | null
  name: string | null
  intro: string | null
}

export interface HealthBookSave {
  type: 1 | 2
  status?: 1 | 2
  externalUrl?: string
  remark?: string
  name?: string
  intro?: string
}

export interface FireArticle {
  articleId: string
  name: string
  type: 1 | 2 | 3
  typeLabel: string
  remark: string | null
  content: string | null
  status: 1 | 2
  statusLabel: string
  updateTime: string | null
}

export interface FireArticleSave {
  articleId?: string
  name: string
  type?: 1 | 2 | 3
  remark?: string
  content?: string
  status?: 1 | 2
}

export interface FirePhone {
  phoneId: string
  name: string
  phone: string
  intro: string | null
  sortOrder: number | null
  status: 1 | 2
  statusLabel: string
}

export interface FirePhoneSave {
  phoneId?: string
  name: string
  phone: string
  intro?: string
  sortOrder?: number
  status?: 1 | 2
}

export interface EnvNews {
  newsId: string
  name: string
  describes: string | null
  content: string | null
  signDate: string | null
  status: 1 | 2
  statusLabel: string
}

export interface EnvNewsSave {
  newsId?: string
  name: string
  describes?: string
  content?: string
  signDate?: string
  status?: 1 | 2
}

export interface EnvCompare {
  compareId: string
  name: string
  address: string | null
  poster: string | null
  logo: string | null
  signDate: string | null
  status: 1 | 2
  statusLabel: string
}

export interface EnvCompareSave {
  compareId?: string
  name: string
  address?: string
  poster?: string
  logo?: string
  signDate?: string
  status?: 1 | 2
}

export interface OpenNote {
  openId: string | null
  type: number | null
  typeLabel: string | null
  content: string | null
}

function useListQuery<T>(queryKey: string, path: string) {
  const { apiFetch } = useApiFetch()
  return useQuery<IResponse<T[]>, Error>({
    queryKey: [queryKey],
    queryFn: async () => await apiFetch<IResponse<T[]>>(path, { method: 'get' }),
    retry: false,
  })
}

function useSingletonQuery<T>(queryKey: string, path: string) {
  const { apiFetch } = useApiFetch()
  return useQuery<IResponse<T>, Error>({
    queryKey: [queryKey],
    queryFn: async () => await apiFetch<IResponse<T>>(path, { method: 'get' }),
    retry: false,
  })
}

function useDetailQuery<T>(queryKey: string, path: (id: string) => string, id: MaybeRefOrGetter<string | undefined>) {
  const { apiFetch } = useApiFetch()
  return useQuery<IResponse<T>, Error>({
    queryKey: computed(() => [queryKey, toValue(id)]),
    enabled: computed(() => !!toValue(id)),
    queryFn: async () => await apiFetch<IResponse<T>>(path(toValue(id)!), { method: 'get' }),
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

function useIdPut(mutationKey: string, path: (id: string) => string, queryKeys: string[]) {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()
  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: [mutationKey],
    mutationFn: async id => await apiFetch<IResponse<boolean>>(path(id), { method: 'put' }),
    onSuccess: () => {
      for (const key of queryKeys)
        queryClient.invalidateQueries({ queryKey: [key] })
    },
  })
}

const repairListKey = 'neighborhoodRepairList'
const repairDetailKey = 'neighborhoodRepairDetail'
const affairListKey = 'neighborhoodAffairList'
const affairDetailKey = 'neighborhoodAffairDetail'
const mailListKey = 'neighborhoodMailList'
const mailDetailKey = 'neighborhoodMailDetail'
const ruleKey = 'neighborhoodPointRuleList'
const accountKey = 'neighborhoodPointAccountList'
const goodsKey = 'neighborhoodPointGoodsList'
const exchangeKey = 'neighborhoodPointExchangeList'
const volunteerListKey = 'neighborhoodVolunteerList'
const volunteerApplyKey = 'neighborhoodVolunteerApplyList'
const volunteerDetailKey = 'neighborhoodVolunteerDetail'
const mediatorKey = 'neighborhoodMediatorList'
const mediateListKey = 'neighborhoodMediateList'
const mediateDetailKey = 'neighborhoodMediateDetail'
const mealKey = 'neighborhoodElderMeal'
const personKey = 'neighborhoodElderPersonList'
const allowanceKey = 'neighborhoodElderAllowanceList'
const flowKey = 'neighborhoodElderFlow'
const visitorKey = 'neighborhoodElderVisitorList'
const visitKey = 'neighborhoodElderVisitList'
const healthKey = 'neighborhoodHealthList'
const healthSignKey = 'neighborhoodHealthSignList'
const healthBookKey = 'neighborhoodHealthBook'
const fireArticleKey = 'neighborhoodFireArticleList'
const firePhoneKey = 'neighborhoodFirePhoneList'
const fireNoteKey = 'neighborhoodFireNote'
const envNewsKey = 'neighborhoodEnvNewsList'
const envCompareKey = 'neighborhoodEnvCompareList'

export function useGetRepairListQuery() {
  return useListQuery<RepairOrder>(repairListKey, '/neighborhood/repair/list')
}
export function useGetRepairDetailQuery(id: MaybeRefOrGetter<string | undefined>) {
  return useDetailQuery<RepairOrder>(repairDetailKey, repairId => `/neighborhood/repair/${repairId}`, id)
}
export function useCreateRepairMutation() {
  return useRecordMutation<RepairSave>('createNeighborhoodRepair', '/neighborhood/repair', 'post', [repairListKey])
}
export function useUpdateRepairMutation() {
  return useRecordMutation<RepairSave>('updateNeighborhoodRepair', '/neighborhood/repair', 'put', [repairListKey, repairDetailKey])
}
export function useDeleteRepairMutation() {
  return useDeleteMutation('deleteNeighborhoodRepair', id => `/neighborhood/repair/${id}`, [repairListKey, repairDetailKey])
}
export function useCreateRepairProgressMutation() {
  return useRecordMutation<RepairProgressSave>('createNeighborhoodRepairProgress', '/neighborhood/repair/progress', 'post', [repairListKey, repairDetailKey])
}

export function useGetAffairListQuery() {
  return useListQuery<Affair>(affairListKey, '/neighborhood/affair/list')
}
export function useGetAffairDetailQuery(id: MaybeRefOrGetter<string | undefined>) {
  return useDetailQuery<Affair>(affairDetailKey, affairId => `/neighborhood/affair/${affairId}`, id)
}
export function useCreateAffairMutation() {
  return useRecordMutation<AffairSave>('createNeighborhoodAffair', '/neighborhood/affair', 'post', [affairListKey])
}
export function useUpdateAffairMutation() {
  return useRecordMutation<AffairSave>('updateNeighborhoodAffair', '/neighborhood/affair', 'put', [affairListKey, affairDetailKey])
}
export function useDeleteAffairMutation() {
  return useDeleteMutation('deleteNeighborhoodAffair', id => `/neighborhood/affair/${id}`, [affairListKey, affairDetailKey])
}

export function useGetMailListQuery() {
  return useListQuery<MailMessage>(mailListKey, '/neighborhood/mail/list')
}
export function useGetMailDetailQuery(id: MaybeRefOrGetter<string | undefined>) {
  return useDetailQuery<MailMessage>(mailDetailKey, mailId => `/neighborhood/mail/${mailId}`, id)
}
export function useReplyMailMutation() {
  return useRecordMutation<MailReplySave>('replyNeighborhoodMail', '/neighborhood/mail/reply', 'put', [mailListKey, mailDetailKey])
}
export function useFinishMailMutation() {
  return useIdPut('finishNeighborhoodMail', id => `/neighborhood/mail/${id}/finish`, [mailListKey, mailDetailKey])
}
export function useDeleteMailMutation() {
  return useDeleteMutation('deleteNeighborhoodMail', id => `/neighborhood/mail/${id}`, [mailListKey, mailDetailKey])
}

export function useGetPointRuleListQuery() {
  return useListQuery<PointRule>(ruleKey, '/neighborhood/point-rule/list')
}
export function useCreatePointRuleMutation() {
  return useRecordMutation<PointRuleSave>('createNeighborhoodPointRule', '/neighborhood/point-rule', 'post', [ruleKey])
}
export function useUpdatePointRuleMutation() {
  return useRecordMutation<PointRuleSave>('updateNeighborhoodPointRule', '/neighborhood/point-rule', 'put', [ruleKey])
}
export function useDeletePointRuleMutation() {
  return useDeleteMutation('deleteNeighborhoodPointRule', id => `/neighborhood/point-rule/${id}`, [ruleKey])
}

export function useGetPointAccountListQuery() {
  return useListQuery<PointAccount>(accountKey, '/neighborhood/point-account/list')
}
export function useAdjustPointMutation() {
  return useRecordMutation<PointAdjustSave>('adjustNeighborhoodPoint', '/neighborhood/point-account/adjust', 'post', [accountKey, exchangeKey, goodsKey])
}

export function useGetPointGoodsListQuery() {
  return useListQuery<PointGoods>(goodsKey, '/neighborhood/point-goods/list')
}
export function useCreatePointGoodsMutation() {
  return useRecordMutation<PointGoodsSave>('createNeighborhoodPointGoods', '/neighborhood/point-goods', 'post', [goodsKey])
}
export function useUpdatePointGoodsMutation() {
  return useRecordMutation<PointGoodsSave>('updateNeighborhoodPointGoods', '/neighborhood/point-goods', 'put', [goodsKey])
}
export function useDeletePointGoodsMutation() {
  return useDeleteMutation('deleteNeighborhoodPointGoods', id => `/neighborhood/point-goods/${id}`, [goodsKey])
}

export function useGetPointExchangeListQuery() {
  return useListQuery<PointExchange>(exchangeKey, '/neighborhood/point-exchange/list')
}
export function useCreatePointExchangeMutation() {
  return useRecordMutation<PointExchangeSave>('createNeighborhoodPointExchange', '/neighborhood/point-exchange', 'post', [exchangeKey, accountKey, goodsKey])
}
export function useReceivePointExchangeMutation() {
  return useIdPut('receiveNeighborhoodPointExchange', id => `/neighborhood/point-exchange/${id}/receive`, [exchangeKey, accountKey, goodsKey])
}

export function useGetVolunteerListQuery() {
  return useListQuery<Volunteer>(volunteerListKey, '/neighborhood/volunteer/list')
}
export function useGetVolunteerApplyListQuery() {
  return useListQuery<Volunteer>(volunteerApplyKey, '/neighborhood/volunteer-apply/list')
}
export function useGetVolunteerDetailQuery(id: MaybeRefOrGetter<string | undefined>) {
  return useDetailQuery<Volunteer>(volunteerDetailKey, volunteerId => `/neighborhood/volunteer/${volunteerId}`, id)
}
export function useCreateVolunteerMutation() {
  return useRecordMutation<VolunteerSave>('createNeighborhoodVolunteer', '/neighborhood/volunteer', 'post', [volunteerListKey])
}
export function useUpdateVolunteerMutation() {
  return useRecordMutation<VolunteerSave>('updateNeighborhoodVolunteer', '/neighborhood/volunteer', 'put', [volunteerListKey, volunteerDetailKey])
}
export function useDeleteVolunteerMutation() {
  return useDeleteMutation('deleteNeighborhoodVolunteer', id => `/neighborhood/volunteer/${id}`, [volunteerListKey, volunteerApplyKey, volunteerDetailKey])
}
export function useAuditVolunteerMutation() {
  return useRecordMutation<{ volunteerId: string, status: 2 | 3 }>('auditNeighborhoodVolunteer', '/neighborhood/volunteer-apply', 'put', [volunteerListKey, volunteerApplyKey, volunteerDetailKey])
}
export function useCreateVolunteerLogMutation() {
  return useRecordMutation<VolunteerLogSave>('createNeighborhoodVolunteerLog', '/neighborhood/volunteer-log', 'post', [volunteerListKey, volunteerDetailKey])
}

export function useGetMediatorListQuery() {
  return useListQuery<Mediator>(mediatorKey, '/neighborhood/mediator/list')
}
export function useCreateMediatorMutation() {
  return useRecordMutation<MediatorSave>('createNeighborhoodMediator', '/neighborhood/mediator', 'post', [mediatorKey])
}
export function useUpdateMediatorMutation() {
  return useRecordMutation<MediatorSave>('updateNeighborhoodMediator', '/neighborhood/mediator', 'put', [mediatorKey])
}
export function useDeleteMediatorMutation() {
  return useDeleteMutation('deleteNeighborhoodMediator', id => `/neighborhood/mediator/${id}`, [mediatorKey])
}

export function useGetMediateListQuery() {
  return useListQuery<MediateCase>(mediateListKey, '/neighborhood/mediate/list')
}
export function useGetMediateDetailQuery(id: MaybeRefOrGetter<string | undefined>) {
  return useDetailQuery<MediateCase>(mediateDetailKey, mediateId => `/neighborhood/mediate/${mediateId}`, id)
}
export function useCreateMediateMutation() {
  return useRecordMutation<MediateSave>('createNeighborhoodMediate', '/neighborhood/mediate', 'post', [mediateListKey])
}
export function useUpdateMediateMutation() {
  return useRecordMutation<MediateSave>('updateNeighborhoodMediate', '/neighborhood/mediate', 'put', [mediateListKey, mediateDetailKey])
}
export function useAcceptMediateMutation() {
  return useRecordMutation<MediateAcceptSave>('acceptNeighborhoodMediate', '/neighborhood/mediate/accept', 'put', [mediateListKey, mediateDetailKey])
}
export function useDeleteMediateMutation() {
  return useDeleteMutation('deleteNeighborhoodMediate', id => `/neighborhood/mediate/${id}`, [mediateListKey, mediateDetailKey])
}

export function useGetElderMealQuery() {
  return useSingletonQuery<ElderMeal>(mealKey, '/neighborhood/elder-meal')
}
export function useUpdateElderMealMutation() {
  return useRecordMutation<ElderMealSave>('updateNeighborhoodElderMeal', '/neighborhood/elder-meal', 'put', [mealKey])
}
export function useGetElderPersonListQuery() {
  return useListQuery<ElderPerson>(personKey, '/neighborhood/elder-person/list')
}
export function useCreateElderPersonMutation() {
  return useRecordMutation<ElderPersonSave>('createNeighborhoodElderPerson', '/neighborhood/elder-person', 'post', [personKey])
}
export function useUpdateElderPersonMutation() {
  return useRecordMutation<ElderPersonSave>('updateNeighborhoodElderPerson', '/neighborhood/elder-person', 'put', [personKey])
}
export function useDeleteElderPersonMutation() {
  return useDeleteMutation('deleteNeighborhoodElderPerson', id => `/neighborhood/elder-person/${id}`, [personKey])
}
export function useGetElderAllowanceListQuery() {
  return useListQuery<ElderAllowance>(allowanceKey, '/neighborhood/elder-allowance/list')
}
export function useCreateElderAllowanceMutation() {
  return useRecordMutation<ElderAllowanceSave>('createNeighborhoodElderAllowance', '/neighborhood/elder-allowance', 'post', [allowanceKey])
}
export function useUpdateElderAllowanceMutation() {
  return useRecordMutation<ElderAllowanceSave>('updateNeighborhoodElderAllowance', '/neighborhood/elder-allowance', 'put', [allowanceKey])
}
export function useDeleteElderAllowanceMutation() {
  return useDeleteMutation('deleteNeighborhoodElderAllowance', id => `/neighborhood/elder-allowance/${id}`, [allowanceKey])
}
export function useGetElderFlowQuery() {
  return useSingletonQuery<OpenNote>(flowKey, '/neighborhood/elder-flow')
}
export function useUpdateElderFlowMutation() {
  return useRecordMutation<{ content?: string }>('updateNeighborhoodElderFlow', '/neighborhood/elder-flow', 'put', [flowKey])
}
export function useGetElderVisitorListQuery() {
  return useListQuery<ElderVisitor>(visitorKey, '/neighborhood/elder-visitor/list')
}
export function useCreateElderVisitorMutation() {
  return useRecordMutation<ElderVisitorSave>('createNeighborhoodElderVisitor', '/neighborhood/elder-visitor', 'post', [visitorKey])
}
export function useUpdateElderVisitorMutation() {
  return useRecordMutation<ElderVisitorSave>('updateNeighborhoodElderVisitor', '/neighborhood/elder-visitor', 'put', [visitorKey])
}
export function useDeleteElderVisitorMutation() {
  return useDeleteMutation('deleteNeighborhoodElderVisitor', id => `/neighborhood/elder-visitor/${id}`, [visitorKey])
}
export function useGetElderVisitListQuery() {
  return useListQuery<ElderVisit>(visitKey, '/neighborhood/elder-visit/list')
}
export function useCreateElderVisitMutation() {
  return useRecordMutation<ElderVisitSave>('createNeighborhoodElderVisit', '/neighborhood/elder-visit', 'post', [visitKey])
}
export function useUpdateElderVisitMutation() {
  return useRecordMutation<ElderVisitSave>('updateNeighborhoodElderVisit', '/neighborhood/elder-visit', 'put', [visitKey])
}
export function useDeleteElderVisitMutation() {
  return useDeleteMutation('deleteNeighborhoodElderVisit', id => `/neighborhood/elder-visit/${id}`, [visitKey])
}

export function useGetHealthListQuery() {
  return useListQuery<HealthRecord>(healthKey, '/neighborhood/health/list')
}
export function useCreateHealthMutation() {
  return useRecordMutation<HealthRecordSave>('createNeighborhoodHealth', '/neighborhood/health', 'post', [healthKey])
}
export function useUpdateHealthMutation() {
  return useRecordMutation<HealthRecordSave>('updateNeighborhoodHealth', '/neighborhood/health', 'put', [healthKey])
}
export function useDeleteHealthMutation() {
  return useDeleteMutation('deleteNeighborhoodHealth', id => `/neighborhood/health/${id}`, [healthKey])
}
export function useGetHealthSignListQuery() {
  return useListQuery<HealthSign>(healthSignKey, '/neighborhood/health-sign/list')
}
export function useCreateHealthSignMutation() {
  return useRecordMutation<HealthSignSave>('createNeighborhoodHealthSign', '/neighborhood/health-sign', 'post', [healthSignKey])
}
export function useUpdateHealthSignMutation() {
  return useRecordMutation<HealthSignSave>('updateNeighborhoodHealthSign', '/neighborhood/health-sign', 'put', [healthSignKey])
}
export function useDeleteHealthSignMutation() {
  return useDeleteMutation('deleteNeighborhoodHealthSign', id => `/neighborhood/health-sign/${id}`, [healthSignKey])
}
export function useGetHealthBookQuery() {
  return useSingletonQuery<HealthBook>(healthBookKey, '/neighborhood/health-book')
}
export function useUpdateHealthBookMutation() {
  return useRecordMutation<HealthBookSave>('updateNeighborhoodHealthBook', '/neighborhood/health-book', 'put', [healthBookKey])
}

export function useGetFireArticleListQuery() {
  return useListQuery<FireArticle>(fireArticleKey, '/neighborhood/fire-article/list')
}
export function useCreateFireArticleMutation() {
  return useRecordMutation<FireArticleSave>('createNeighborhoodFireArticle', '/neighborhood/fire-article', 'post', [fireArticleKey])
}
export function useUpdateFireArticleMutation() {
  return useRecordMutation<FireArticleSave>('updateNeighborhoodFireArticle', '/neighborhood/fire-article', 'put', [fireArticleKey])
}
export function useDeleteFireArticleMutation() {
  return useDeleteMutation('deleteNeighborhoodFireArticle', id => `/neighborhood/fire-article/${id}`, [fireArticleKey])
}
export function useGetFirePhoneListQuery() {
  return useListQuery<FirePhone>(firePhoneKey, '/neighborhood/fire-phone/list')
}
export function useCreateFirePhoneMutation() {
  return useRecordMutation<FirePhoneSave>('createNeighborhoodFirePhone', '/neighborhood/fire-phone', 'post', [firePhoneKey])
}
export function useUpdateFirePhoneMutation() {
  return useRecordMutation<FirePhoneSave>('updateNeighborhoodFirePhone', '/neighborhood/fire-phone', 'put', [firePhoneKey])
}
export function useDeleteFirePhoneMutation() {
  return useDeleteMutation('deleteNeighborhoodFirePhone', id => `/neighborhood/fire-phone/${id}`, [firePhoneKey])
}
export function useGetFireNoteQuery() {
  return useSingletonQuery<OpenNote>(fireNoteKey, '/neighborhood/fire-note')
}
export function useUpdateFireNoteMutation() {
  return useRecordMutation<{ content?: string }>('updateNeighborhoodFireNote', '/neighborhood/fire-note', 'put', [fireNoteKey])
}

export function useGetEnvNewsListQuery() {
  return useListQuery<EnvNews>(envNewsKey, '/neighborhood/env-news/list')
}
export function useCreateEnvNewsMutation() {
  return useRecordMutation<EnvNewsSave>('createNeighborhoodEnvNews', '/neighborhood/env-news', 'post', [envNewsKey])
}
export function useUpdateEnvNewsMutation() {
  return useRecordMutation<EnvNewsSave>('updateNeighborhoodEnvNews', '/neighborhood/env-news', 'put', [envNewsKey])
}
export function useDeleteEnvNewsMutation() {
  return useDeleteMutation('deleteNeighborhoodEnvNews', id => `/neighborhood/env-news/${id}`, [envNewsKey])
}
export function useGetEnvCompareListQuery() {
  return useListQuery<EnvCompare>(envCompareKey, '/neighborhood/env-compare/list')
}
export function useCreateEnvCompareMutation() {
  return useRecordMutation<EnvCompareSave>('createNeighborhoodEnvCompare', '/neighborhood/env-compare', 'post', [envCompareKey])
}
export function useUpdateEnvCompareMutation() {
  return useRecordMutation<EnvCompareSave>('updateNeighborhoodEnvCompare', '/neighborhood/env-compare', 'put', [envCompareKey])
}
export function useDeleteEnvCompareMutation() {
  return useDeleteMutation('deleteNeighborhoodEnvCompare', id => `/neighborhood/env-compare/${id}`, [envCompareKey])
}
