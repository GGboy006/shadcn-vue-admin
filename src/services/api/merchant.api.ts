import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageResult, IResponse } from '../types/response.type'

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
  /** 服务居民数（居委会） */
  serveResidents?: number
  /** 成员数（居委会） */
  members?: number
  /** 备注 */
  remark: string
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

// ==================== 居委会（站长侧 /station/neighborhood） ====================

/**
 * 新增居委会 DTO（对接文档 1.3 BusinessOrgAddDTO）。
 *
 * 与商户通用 AddDTO 的区别:
 * - merchantCode 必填(城市居委会标识,站长手动粘贴)
 * - 无 password(后端从城市库拉取手机号生成本地账号)
 * - 无 type(后端固定为 6,前端不传)
 * - 含居委会特有的 serveResidents/members
 */
export interface ICommitteeAddDTO {
  /** 城市居委会标识（绑定用,站长手动粘贴输入） */
  merchantCode: string
  /** 本地管理员昵称 */
  nickname: string
  /** 头像 URL */
  avatar?: string
  /** 性别：0=未知，1=男，2=女 */
  gender?: Gender
  /** 联系人 */
  contactName?: string
  /** 联系电话 */
  contactPhone?: string
  /** 详细地址 */
  address?: string
  /** 签约日期 */
  signDate?: string
  /** 签约费用 */
  signFee?: number
  /** 服务居民数，默认 0 */
  serveResidents?: number
  /** 成员数，默认 0 */
  members?: number
  /** 简介；为空时用城市库简介 */
  remark?: string
  /** 1=启用，2=禁用 */
  status?: MerchantStatus
}

/**
 * 更新居委会 DTO（对接文档 1.4 BusinessOrgUpdateDTO）。
 *
 * merchantId 必填（居委会本地 ID，必须归属当前站长）；
 * password 为空则不修改；type 后端固定为 6。
 */
export interface ICommitteeUpdateDTO {
  /** 居委会本地 ID */
  merchantId: string
  /** 昵称 */
  nickname?: string
  /** 登录手机号 */
  phone?: string
  /** 登录密码；空则不修改 */
  password?: string
  /** 头像 */
  avatar?: string
  /** 性别 */
  gender?: Gender
  /** 居委会名称 */
  merchantName?: string
  /** Logo */
  logo?: string
  /** 联系人 */
  contactName?: string
  /** 联系电话 */
  contactPhone?: string
  /** 详细地址 */
  address?: string
  /** 签约日期 */
  signDate?: string
  /** 签约费用 */
  signFee?: number
  /** 服务居民数 */
  serveResidents?: number
  /** 成员数 */
  members?: number
  /** 简介（同步城市 instruction） */
  remark?: string
  /** 1=启用，2=禁用 */
  status?: MerchantStatus
}

/** 分页列表响应 */
export type IMerchantListResponse = IResponse<IPageResult<IMerchant>>

/** 详情响应 */
export type IMerchantDetailResponse = IResponse<IMerchant>

// ==================== 商户分类（站长端，/station/merchant/category） ====================

/**
 * 商户分类 VO（对接文档 2.1/2.2 TblCouponCategoryResp）。
 *
 * 底层复用 `tbl_coupon_category` 表（type 固定为商户分类），
 * layoutType 为该表遗留的通用布局字段，本模块暂不在 UI 中使用。
 */
export interface IMerchantCategoryVO {
  /** 分类唯一标识，即商户侧 categoryCode */
  uniqueCode: string
  /** 分类名称 */
  name: string
  /** 排序 */
  torder: number
  /** 状态：1=启用，2=禁用 */
  status: MerchantStatus
  /** 分类类型：固定为商户分类 */
  type: number
  /** 布局：1美团 2饿了么 3滴滴 4快递100（遗留字段，暂不使用） */
  layoutType?: number
  /** 合伙人ID */
  partnerId: string
  createTime?: string
  updateTime?: string
}

/** 商户分类分页查询参数 */
export interface IMerchantCategoryPageQuery {
  /** 分类名称模糊 */
  keyword?: string
  pageNum: number
  pageSize: number
}

/** 新增商户分类 DTO */
export interface IMerchantCategoryAddDTO {
  name: string
  torder?: number
  status?: MerchantStatus
  layoutType?: number
}

/** 更新商户分类 DTO */
export interface IMerchantCategoryUpdateDTO {
  uniqueCode: string
  name: string
  torder?: number
  status?: MerchantStatus
  layoutType?: number
}

/** 获取商户分类分页列表 */
export function useGetMerchantCategoryPageQuery(query: Ref<IMerchantCategoryPageQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IResponse<IPageResult<IMerchantCategoryVO>>, Error>({
    queryKey: ['merchantCategoryPage', query],
    queryFn: async () => await apiFetch<IResponse<IPageResult<IMerchantCategoryVO>>>('/station/merchant/category/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 获取全部已启用商户分类（下拉选项用） */
export function useGetMerchantCategoryListQuery(enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IResponse<IMerchantCategoryVO[]>, Error>({
    queryKey: ['merchantCategoryAll'],
    queryFn: async () => await apiFetch<IResponse<IMerchantCategoryVO[]>>('/station/merchant/category/list', {
      method: 'get',
    }),
    enabled: () => enabled?.value ?? true,
    retry: false,
  })
}

/** 新增商户分类 */
export function useCreateMerchantCategoryMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<string>, Error, IMerchantCategoryAddDTO>({
    mutationKey: ['createMerchantCategory'],
    mutationFn: async data => await apiFetch<IResponse<string>>('/station/merchant/category', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantCategoryPage'] })
      queryClient.invalidateQueries({ queryKey: ['merchantCategoryAll'] })
    },
  })
}

/** 更新商户分类 */
export function useUpdateMerchantCategoryMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IMerchantCategoryUpdateDTO>({
    mutationKey: ['updateMerchantCategory'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/station/merchant/category', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantCategoryPage'] })
      queryClient.invalidateQueries({ queryKey: ['merchantCategoryAll'] })
    },
  })
}

/** 删除商户分类 */
export function useDeleteMerchantCategoryMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deleteMerchantCategory'],
    mutationFn: async uniqueCode => await apiFetch<IResponse<boolean>>(`/station/merchant/category/${uniqueCode}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantCategoryPage'] })
      queryClient.invalidateQueries({ queryKey: ['merchantCategoryAll'] })
    },
  })
}

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
export function useGetMerchantDetailQuery(merchantId: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IMerchantDetailResponse, Error>({
    queryKey: ['merchantDetail', merchantId],
    queryFn: async () => await apiFetch<IMerchantDetailResponse>(`/station/merchant/${merchantId.value}`, {
      method: 'get',
    }),
    // 默认仅 merchantId 有值即请求;组件层可传入更严格的 enabled(如弹层打开才请求),
    // 此时仍需 id 有值(组件传 isOpen 时,新建场景 id 为空,必须由 &&!!id 拦住避免 /merchant/undefined)。
    enabled: () => (enabled?.value ?? true) && !!merchantId.value,
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

/**
 * 新增居委会（对接文档 1.3，`POST /station/neighborhood`）。
 *
 * 绑定城市居委会并创建本地管理员账号；名称/手机号/密码/Logo 等从城市库拉取。
 * merchantCode 必须在城市库存在且未被绑定。
 */
export function useCreateCommitteeMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, ICommitteeAddDTO>({
    mutationKey: ['createCommittee'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/station/neighborhood', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantList'] })
    },
  })
}

/**
 * 更新居委会（对接文档 1.4，`PUT /station/neighborhood`）。
 *
 * 站长更新居委会资料，并同步城市 updateOrg。
 * 仅允许操作 type=6 且归属当前站长的数据。
 */
export function useUpdateCommitteeMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, ICommitteeUpdateDTO>({
    mutationKey: ['updateCommittee'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/station/neighborhood', {
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
