import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IResponse } from '../types/response.type'

/** 商户/物业类型：4=商户，5=物业，6=居委会 */
export type MerchantType = 4 | 5 | 6

/** 状态：1=启用，2=禁用 */
export type MerchantStatus = 1 | 2

/** 性别：0=未知，1=男，2=女 */
export type Gender = 0 | 1 | 2

/** 用户状态：1=正常，2=禁用 */
export type UserStatus = 1 | 2

/** 营业状态：1=营业中，2=休息中，3=已打烊，4=暂停营业 */
export type BusinessStatus = 1 | 2 | 3 | 4

/** 结算周期：1=T+1，2=T+7，3=T+30 */
export type SettlementCycle = 1 | 2 | 3

/** 类型映射配置 */
export const merchantTypeConfig: Record<MerchantType, { label: string, variant: 'info' | 'success' | 'warning' | 'default' }> = {
  4: { label: '商户', variant: 'info' },
  5: { label: '物业', variant: 'success' },
  6: { label: '居委会', variant: 'warning' },
}

/** 状态映射配置 */
export const merchantStatusConfig: Record<MerchantStatus, { label: string, variant: 'default' | 'secondary' }> = {
  1: { label: '启用', variant: 'default' },
  2: { label: '禁用', variant: 'secondary' },
}

/** 性别映射配置 */
export const genderConfig: Record<Gender, string> = {
  0: '未知',
  1: '男',
  2: '女',
}

/** 营业状态映射配置 */
export const businessStatusConfig: Record<BusinessStatus, { label: string, variant: 'info' | 'warning' | 'secondary' | 'destructive' }> = {
  1: { label: '营业中', variant: 'info' },
  2: { label: '休息中', variant: 'warning' },
  3: { label: '已打烊', variant: 'secondary' },
  4: { label: '暂停营业', variant: 'destructive' },
}

/** 结算周期映射配置 */
export const settlementCycleConfig: Record<SettlementCycle, string> = {
  1: 'T+1',
  2: 'T+7',
  3: 'T+30',
}

/** 类型筛选选项 */
export const merchantTypeOptions = [
  { label: '全部', value: 'all' },
  { label: '商户', value: '4' },
  { label: '物业', value: '5' },
  { label: '居委会', value: '6' },
] as const

/** 状态筛选选项 */
export const merchantStatusOptions = [
  { label: '全部', value: 'all' },
  { label: '启用', value: '1' },
  { label: '禁用', value: '2' },
] as const

/** 分页列表查询参数 */
export interface IMerchantListQuery {
  /** 名称（模糊搜索） */
  merchantName?: string
  /** 类型：4=商户，5=物业，6=居委会 */
  type?: string
  /** 签约状态：1=已签约，2=未签约 */
  signStatus?: string
  /** 状态：1=启用，2=禁用 */
  status?: string
  /** 页码 */
  pageNum: number
  /** 每页数量 */
  pageSize: number
  /** 是否查询总条数 */
  searchCount?: string
  /** 排序字段集合 */
  sortItemList?: string
}

/** 商户/物业 VO */
export interface IMerchant {
  /** 商户ID */
  merchantId: string
  /** 昵称 */
  nickname: string
  /** 手机号 */
  phone: string
  /** 头像 */
  avatar: string
  /** 性别：0=未知，1=男，2=女 */
  gender: Gender
  /** 用户状态：1=正常，2=禁用 */
  userStatus: UserStatus
  /** 最后登录时间 */
  lastLoginTime: string
  /** 商户编号 */
  merchantCode: string
  /** 商户/物业名称 */
  merchantName: string
  /** 分类标识 */
  categoryCode: string
  /** Logo */
  logo: string
  /** 轮播图JSON（如：["url1","url2"]） */
  bannerImages: string
  /** 所属小区站长用户ID */
  stationUserId: number
  /** 类型：4=商户，5=物业，6=居委会 */
  type: MerchantType
  /** 联系人 */
  contactName: string
  /** 联系电话 */
  contactPhone: string
  /** 详细地址 */
  address: string
  /** 外部链接（物业） */
  externalUrl: string
  /** 签约日期 */
  signDate: string
  /** 签约费用 */
  signFee: number
  /** 营业状态：1=营业中，2=休息中，3=已打烊，4=暂停营业（商户） */
  businessStatus: BusinessStatus
  /** 营业时间（商户） */
  businessHours: string
  /** 起送金额（商户使用） */
  minDeliveryAmount: number
  /** 配送费（商户使用） */
  deliveryFee: number
  /** 结算周期：1=T+1，2=T+7，3=T+30（商户） */
  settlementCycle: SettlementCycle
  /** 状态：1=启用，2=禁用 */
  status: MerchantStatus
  /** 备注 */
  remark: string
}

/** 分页结果 */
export interface IPageResult<T> {
  /** 当前页 */
  pageNum: number
  /** 每页的数量 */
  pageSize: number
  /** 总记录数 */
  total: number
  /** 总页数 */
  pages: number
  /** 结果集 */
  list: T[]
  /** 是否为空 */
  emptyFlag: boolean
}

/** 新增商户/物业 DTO */
export interface IMerchantAddDTO {
  /** 昵称 */
  nickname: string
  /** 手机号 */
  phone: string
  /** 登录密码 */
  password: string
  /** 头像 */
  avatar?: string
  /** 性别：0=未知，1=男，2=女 */
  gender?: Gender
  /** 商户/物业名称 */
  merchantName: string
  /** 分类标识 */
  categoryCode?: string
  /** logo */
  logo?: string
  /** 轮播图JSON（如：["url1","url2"]） */
  bannerImages?: string[]
  /** 类型：4=商户，5=物业，6=居委会 */
  type: MerchantType
  /** 联系人 */
  contactName?: string
  /** 联系电话 */
  contactPhone?: string
  /** 详细地址 */
  address?: string
  /** 外部链接（物业） */
  externalUrl?: string
  /** 签约日期 */
  signDate?: string
  /** 签约费用 */
  signFee?: number
  /** 营业状态：1=营业中，2=休息中，3=已打烊，4=暂停营业（商户） */
  businessStatus?: BusinessStatus
  /** 营业时间（商户） */
  businessHours?: string
  /** 结算周期：1=T+1，2=T+7，3=T+30（商户） */
  settlementCycle?: SettlementCycle
  /** 备注 */
  remark?: string
  /** 状态：1=启用，2=禁用 */
  status?: MerchantStatus
}

/** 更新商户/物业 DTO */
export interface IMerchantUpdateDTO {
  /** 商户ID */
  merchantId: string
  /** 用户昵称 */
  nickname?: string
  /** 手机号 */
  phone?: string
  /** 登录密码（传空则不修改） */
  password?: string
  /** 头像 */
  avatar?: string
  /** 性别：0=未知，1=男，2=女 */
  gender?: Gender
  /** 商户/物业名称 */
  merchantName?: string
  /** 分类标识 */
  categoryCode?: string
  /** logo */
  logo?: string
  /** 轮播图JSON（如：["url1","url2"]） */
  bannerImages?: string[]
  /** 类型：4=商户，5=物业，6=居委会 */
  type: MerchantType
  /** 联系人 */
  contactName?: string
  /** 联系电话 */
  contactPhone?: string
  /** 详细地址 */
  address?: string
  /** 外部链接（物业） */
  externalUrl?: string
  /** 签约日期 */
  signDate?: string
  /** 签约费用 */
  signFee?: number
  /** 营业状态：1=营业中，2=休息中，3=已打烊，4=暂停营业（商户） */
  businessStatus?: BusinessStatus
  /** 营业时间（商户） */
  businessHours?: string
  /** 结算周期：1=T+1，2=T+7，3=T+30（商户） */
  settlementCycle?: SettlementCycle
  /** 备注 */
  remark?: string
  /** 状态：1=启用，2=禁用 */
  status?: MerchantStatus
}

/** 分页列表响应 */
export type IMerchantListResponse = IResponse<IPageResult<IMerchant>>

/** 详情响应 */
export type IMerchantDetailResponse = IResponse<IMerchant>

// ==================== API 封装 ====================

/** 获取商户/物业分页列表 */
export function useGetMerchantListQuery(query: Ref<IMerchantListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IMerchantListResponse, Error>({
    queryKey: ['merchantList', query],
    queryFn: async () => await apiFetch<IMerchantListResponse>('/station/merchant/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 获取商户/物业详情 */
export function useGetMerchantDetailQuery(merchantId: Ref<string | undefined>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IMerchantDetailResponse, Error>({
    queryKey: ['merchantDetail', merchantId],
    queryFn: async () => await apiFetch<IMerchantDetailResponse>(`/station/merchant/${merchantId.value}`, {
      method: 'get',
    }),
    enabled: () => !!merchantId.value,
    retry: false,
  })
}

/** 新增商户/物业 */
export function useCreateMerchantMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IMerchantAddDTO>({
    mutationKey: ['createMerchant'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/station/merchant', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantList'] })
    },
  })
}

/** 更新商户/物业 */
export function useUpdateMerchantMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IMerchantUpdateDTO>({
    mutationKey: ['updateMerchant'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/station/merchant', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantList'] })
      queryClient.invalidateQueries({ queryKey: ['merchantDetail'] })
    },
  })
}

/** 删除商户/物业 */
export function useDeleteMerchantMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deleteMerchant'],
    mutationFn: async merchantId => await apiFetch<IResponse<boolean>>(`/station/merchant/${merchantId}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantList'] })
    },
  })
}

/** 启用/禁用商户/物业 */
export function useToggleMerchantStatusMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, { merchantId: string, status: MerchantStatus }>({
    mutationKey: ['toggleMerchantStatus'],
    mutationFn: async ({ merchantId, status }) => await apiFetch<IResponse<boolean>>(`/station/merchant/${merchantId}/status`, {
      method: 'put',
      query: { status },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantList'] })
      queryClient.invalidateQueries({ queryKey: ['merchantDetail'] })
    },
  })
}
