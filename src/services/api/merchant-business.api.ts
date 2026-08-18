import type { Ref } from 'vue'

import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageResult, IResponse } from '../types/response.type'

import { merchantBusinessKey, merchantModulePath } from './merchant-business-urls'

// 纯函数 builder 从 merchant-business-urls.ts 导入并 re-export,便于调用方统一引用
export { merchantBusinessKey, merchantModulePath }
export type { MerchantModule } from './merchant-business-urls'

// ==================== 通用分页类型 ====================

/** 分页请求参数(PageParam) */
export interface IPageQuery {
  /** 页码,从1开始 */
  pageNum: number
  /** 每页数量,最大200 */
  pageSize: number
  /** 是否查询总条数 */
  searchCount?: boolean
}

// ==================== 一、商户信息 ====================

/** 商户类型:4=商户,5=物业,6=居委会 */
export type MerchantType = 4 | 5 | 6
/** 状态:1=启用,2=禁用 */
export type MerchantStatus = 1 | 2
/** 性别:0=未知,1=男,2=女 */
export type Gender = 0 | 1 | 2
/** 用户状态:1=正常,2=禁用 */
export type UserStatus = 1 | 2
/** 营业状态:1=营业中,2=休息中,3=已打烊,4=暂停营业 */
export type BusinessStatus = 1 | 2 | 3 | 4
/** 结算周期:1=T+1,2=T+7,3=T+30 */
export type SettlementCycle = 1 | 2 | 3

/** 商户信息 VO(文档 1.1) */
export interface IMerchantBusinessVO {
  merchantId: string
  merchantCode: string
  merchantName: string
  type: MerchantType
  logo: string
  poster: string
  bannerImages: string[]
  otherImages: string[]
  contactName: string
  contactPhone: string
  address: string
  externalUrl: string
  signDate: string
  signFee: number
  businessStatus: BusinessStatus
  businessHours: string
  minDeliveryAmount: number
  deliveryFee: number
  /** 人均消费(更新 DTO 有,VO 部分后端可能返回) */
  consumptionPerCapita?: number
  settlementCycle: SettlementCycle
  status: MerchantStatus
  remark: string
  nickname: string
  phone: string
  avatar: string
  gender: Gender
  userStatus: UserStatus
  lastLoginTime: string
}

/** 更新商户信息 DTO(文档 1.2) */
export interface IMerchantBusinessUpdateDTO {
  merchantId: string
  nickname?: string
  phone?: string
  password?: string
  avatar?: string
  gender?: Gender
  merchantName?: string
  logo?: string
  bannerImages?: string[]
  otherImages?: string[]
  type: MerchantType
  systemFaqId?: number
  contactName?: string
  contactPhone?: string
  address?: string
  externalUrl?: string
  signDate?: string
  signFee?: number
  businessStatus?: BusinessStatus
  businessHours?: string
  consumptionPerCapita?: number
  settlementCycle?: SettlementCycle
  remark?: string
  status?: MerchantStatus
}

/** 商户信息响应 */
export type IMerchantBusinessInfoResponse = IResponse<IMerchantBusinessVO>

/**
 * 获取商户自身信息(无参,后端靠 token 识别)。
 *
 * 仅商户/物业自身调用;站长不调此接口(Q1 已确认)。
 */
export function useGetMyMerchantInfoQuery() {
  const { apiFetch } = useApiFetch()

  return useQuery<IMerchantBusinessInfoResponse, Error>({
    queryKey: ['merchantBusiness', 'myMerchantInfo'],
    queryFn: async () => await apiFetch<IMerchantBusinessInfoResponse>('/merchant/myMerchantInfo', {
      method: 'get',
    }),
    retry: false,
  })
}

/** 更新商户信息 */
export function useUpdateMyMerchantInfoMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IMerchantBusinessUpdateDTO>({
    mutationKey: ['updateMyMerchantInfo'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/merchant/updateMyMerchantInfo', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantBusiness', 'myMerchantInfo'] })
    },
  })
}

// ==================== 二、商户分类 ====================

/** 分类 VO(文档 2.1) */
export interface ICateResp {
  id: number
  uniqueCode: string
  orgCode: string
  name: string
  type: number
  torder: number
  isEnable: 1 | 2
}

/** 分类分页 VO(文档 2.2) */
export interface ICateVO {
  uniqueCode: string
  orgCode: string
  name: string
  torder: number
  isEnable: 1 | 2
  goodsCount: number
}

/** 分类新增 DTO */
export interface ICateAddReq {
  name: string
  torder?: number
}

/** 分类更新 DTO */
export interface ICateUpdateReq {
  cateCode: string
  name: string
  torder?: number
}

/** 分类分页查询参数 */
export interface ICatePageQuery extends IPageQuery {}

/** 获取全部分类 */
export function useGetCateAllQuery(merchantId: Ref<string>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IResponse<ICateResp[]>, Error>({
    queryKey: merchantBusinessKey('cate', merchantId.value, 'all'),
    queryFn: async () => await apiFetch<IResponse<ICateResp[]>>(`${merchantModulePath('cate', merchantId.value)}/all`, {
      method: 'get',
    }),
    enabled: () => !!merchantId.value,
    retry: false,
  })
}

/** 获取分类分页列表 */
export function useGetCatePageQuery(merchantId: Ref<string>, query: Ref<ICatePageQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IResponse<IPageResult<ICateVO>>, Error>({
    queryKey: merchantBusinessKey('cate', merchantId.value, 'page', query),
    queryFn: async () => await apiFetch<IResponse<IPageResult<ICateVO>>>(`${merchantModulePath('cate', merchantId.value)}/page`, {
      method: 'get',
      query: query.value,
    }),
    enabled: () => !!merchantId.value,
    retry: false,
  })
}

/** 新增分类 */
export function useCreateCateMutation(merchantId: Ref<string>) {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, ICateAddReq>({
    mutationKey: ['merchantBusiness', 'cate', 'create'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>(merchantModulePath('cate', merchantId.value), {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantBusiness', 'cate'] })
    },
  })
}

/** 更新分类 */
export function useUpdateCateMutation(merchantId: Ref<string>) {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, ICateUpdateReq>({
    mutationKey: ['merchantBusiness', 'cate', 'update'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>(merchantModulePath('cate', merchantId.value), {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantBusiness', 'cate'] })
    },
  })
}

/** 删除分类 */
export function useDeleteCateMutation(merchantId: Ref<string>) {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['merchantBusiness', 'cate', 'delete'],
    mutationFn: async cateCode => await apiFetch<IResponse<boolean>>(`${merchantModulePath('cate', merchantId.value)}/${cateCode}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantBusiness', 'cate'] })
    },
  })
}

// ==================== 二.二、优惠活动分类 ====================

/**
 * 优惠活动分类 Resp（对接文档 4.1，全部/下拉用）。
 *
 * 与商品分类同表 `tbl_app_enterprise_cate`，但 type=1（企业活动），
 * 路径为 `/merchant/activity/cate/{merchantId}`，不要与商品分类 `/merchant/cate` 混淆。
 */
export interface IActivityCateResp {
  uniqueCode: string
  orgCode: string
  name: string
  type: number
  torder: number
  isEnable: 1 | 2
}

/** 优惠活动分类分页 VO（文档 4.2） */
export interface IActivityCateVO {
  uniqueCode: string
  orgCode: string
  name: string
  torder: number
  isEnable: 1 | 2
  activityCount: number
}

/** 优惠活动分类新增 DTO */
export interface IActivityCateAddReq {
  name: string
  torder?: number
}

/** 优惠活动分类更新 DTO */
export interface IActivityCateUpdateReq {
  cateCode: string
  name: string
  torder?: number
}

/** 优惠活动分类分页查询参数 */
export interface IActivityCatePageQuery extends IPageQuery {}

/** 获取全部优惠活动分类（下拉选项用） */
export function useGetActivityCateAllQuery(merchantId: Ref<string>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IResponse<IActivityCateResp[]>, Error>({
    queryKey: merchantBusinessKey('activityCate', merchantId.value, 'all'),
    queryFn: async () => await apiFetch<IResponse<IActivityCateResp[]>>(`${merchantModulePath('activity/cate', merchantId.value)}/all`, {
      method: 'get',
    }),
    enabled: () => !!merchantId.value,
    retry: false,
  })
}

/** 获取优惠活动分类分页列表 */
export function useGetActivityCatePageQuery(merchantId: Ref<string>, query: Ref<IActivityCatePageQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IResponse<IPageResult<IActivityCateVO>>, Error>({
    queryKey: merchantBusinessKey('activityCate', merchantId.value, 'page', query),
    queryFn: async () => await apiFetch<IResponse<IPageResult<IActivityCateVO>>>(`${merchantModulePath('activity/cate', merchantId.value)}/page`, {
      method: 'get',
      query: query.value,
    }),
    enabled: () => !!merchantId.value,
    retry: false,
  })
}

/** 新增优惠活动分类 */
export function useCreateActivityCateMutation(merchantId: Ref<string>) {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IActivityCateAddReq>({
    mutationKey: ['merchantBusiness', 'activityCate', 'create'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>(merchantModulePath('activity/cate', merchantId.value), {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantBusiness', 'activityCate'] })
    },
  })
}

/** 更新优惠活动分类（改名后端会同步该分类下活动的 cateName） */
export function useUpdateActivityCateMutation(merchantId: Ref<string>) {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IActivityCateUpdateReq>({
    mutationKey: ['merchantBusiness', 'activityCate', 'update'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>(merchantModulePath('activity/cate', merchantId.value), {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantBusiness', 'activityCate'] })
    },
  })
}

/** 删除优惠活动分类（分类下仍有活动时不可删除） */
export function useDeleteActivityCateMutation(merchantId: Ref<string>) {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['merchantBusiness', 'activityCate', 'delete'],
    mutationFn: async cateCode => await apiFetch<IResponse<boolean>>(`${merchantModulePath('activity/cate', merchantId.value)}/${cateCode}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantBusiness', 'activityCate'] })
    },
  })
}

// ==================== 三、商品 ====================

/** 商品分页 VO(文档 3.1) */
export interface IGoodsVO {
  uniqueCode: string
  orgCode: string
  name: string
  poster: string
  cateName: string
  describes: string
  salePrice: number
  content: string
  isRecommend: 1 | 2
  isEnable: 1 | 2
}

/** 商品详情 Resp(文档 3.2) */
export interface IGoodsResp {
  uniqueCode: string
  orgCode: string
  name: string
  poster: string
  detailPoster: string
  cateCode: string
  cateName: string
  describes: string
  content: string
  salePrice: number
  torder: number
  isRecommend: 1 | 2
  isEnable: 1 | 2
  /** 0=收费,1=免费 */
  freeFlag?: 0 | 1
  createTime: string
  updateTime: string
}

/** 商品新增 DTO(文档 3.3) */
export interface IGoodsAddReq {
  cateCode: string
  cateName: string
  name: string
  poster?: string
  detailPoster?: string
  describes?: string
  content?: string
  salePrice?: number
  torder?: number
  isRecommend?: 1 | 2
  /** 0=收费,1=免费 */
  freeFlag?: 0 | 1
}

/** 商品更新 DTO(继承 Add,增加 goodsCode) */
export interface IGoodsUpdateReq extends IGoodsAddReq {
  goodsCode: string
}

/** 商品分页查询参数 */
export interface IGoodsPageQuery extends IPageQuery {
  cateCode?: string
  keyword?: string
}

/** 获取商品分页列表 */
export function useGetGoodsPageQuery(merchantId: Ref<string>, query: Ref<IGoodsPageQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IResponse<IPageResult<IGoodsVO>>, Error>({
    queryKey: merchantBusinessKey('goods', merchantId.value, 'page', query),
    queryFn: async () => await apiFetch<IResponse<IPageResult<IGoodsVO>>>(`${merchantModulePath('goods', merchantId.value)}/page`, {
      method: 'get',
      query: query.value,
    }),
    enabled: () => !!merchantId.value,
    retry: false,
  })
}

/** 获取商品详情 */
export function useGetGoodsDetailQuery(merchantId: Ref<string>, goodsCode: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IResponse<IGoodsResp>, Error>({
    queryKey: merchantBusinessKey('goods', merchantId.value, 'detail', goodsCode),
    queryFn: async () => await apiFetch<IResponse<IGoodsResp>>(`${merchantModulePath('goods', merchantId.value)}/detail`, {
      method: 'get',
      query: { goodsCode: goodsCode.value },
    }),
    enabled: () => (enabled?.value ?? true) && !!merchantId.value && !!goodsCode.value,
    retry: false,
  })
}

/** 新增商品 */
export function useCreateGoodsMutation(merchantId: Ref<string>) {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<string>, Error, IGoodsAddReq>({
    mutationKey: ['merchantBusiness', 'goods', 'create'],
    mutationFn: async data => await apiFetch<IResponse<string>>(merchantModulePath('goods', merchantId.value), {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantBusiness', 'goods'] })
    },
  })
}

/** 更新商品 */
export function useUpdateGoodsMutation(merchantId: Ref<string>) {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IGoodsUpdateReq>({
    mutationKey: ['merchantBusiness', 'goods', 'update'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>(merchantModulePath('goods', merchantId.value), {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantBusiness', 'goods'] })
    },
  })
}

/** 删除商品 */
export function useDeleteGoodsMutation(merchantId: Ref<string>) {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['merchantBusiness', 'goods', 'delete'],
    mutationFn: async goodsCode => await apiFetch<IResponse<boolean>>(`${merchantModulePath('goods', merchantId.value)}/${goodsCode}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantBusiness', 'goods'] })
    },
  })
}

// ==================== 四、FAQ ====================

/** FAQ Resp(文档 4.1) */
export interface IFaqResp {
  uniqueCode: string
  merchantCode: string
  categoryName: string
  question: string
  answer: string
  torder: number
  isEnable: 1 | 2
  createTime: string
  updateTime: string
}

/** FAQ 新增 DTO */
export interface IFaqAddReq {
  categoryName?: string
  question: string
  answer: string
  torder?: number
  isEnable?: 1 | 2
}

/** FAQ 更新 DTO(继承 Add,增加 faqCode) */
export interface IFaqUpdateReq extends IFaqAddReq {
  faqCode: string
}

/** FAQ 分页查询参数 */
export interface IFaqPageQuery extends IPageQuery {
  keyword?: string
}

/** 获取 FAQ 分页列表 */
export function useGetFaqPageQuery(merchantId: Ref<string>, query: Ref<IFaqPageQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IResponse<IPageResult<IFaqResp>>, Error>({
    queryKey: merchantBusinessKey('faq', merchantId.value, 'page', query),
    queryFn: async () => await apiFetch<IResponse<IPageResult<IFaqResp>>>(`${merchantModulePath('faq', merchantId.value)}/page`, {
      method: 'get',
      query: query.value,
    }),
    enabled: () => !!merchantId.value,
    retry: false,
  })
}

/** 新增 FAQ */
export function useCreateFaqMutation(merchantId: Ref<string>) {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<string>, Error, IFaqAddReq>({
    mutationKey: ['merchantBusiness', 'faq', 'create'],
    mutationFn: async data => await apiFetch<IResponse<string>>(merchantModulePath('faq', merchantId.value), {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantBusiness', 'faq'] })
    },
  })
}

/** 更新 FAQ */
export function useUpdateFaqMutation(merchantId: Ref<string>) {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IFaqUpdateReq>({
    mutationKey: ['merchantBusiness', 'faq', 'update'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>(merchantModulePath('faq', merchantId.value), {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantBusiness', 'faq'] })
    },
  })
}

/** 删除 FAQ */
export function useDeleteFaqMutation(merchantId: Ref<string>) {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['merchantBusiness', 'faq', 'delete'],
    mutationFn: async faqCode => await apiFetch<IResponse<boolean>>(`${merchantModulePath('faq', merchantId.value)}/${faqCode}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantBusiness', 'faq'] })
    },
  })
}

// ==================== 五、优惠活动 ====================

/** 活动 Resp(文档 5.1) */
export interface IActivityResp {
  id: number
  uniqueCode: string
  orgCode: string
  name: string
  poster: string
  detailPoster: string
  sponsorName: string
  cateCode: string
  cateName: string
  describes: string
  content: string
  address: string
  /** 1=收费,2=免费 */
  isCharge: 1 | 2
  salePrice: number
  startTime: string
  endTime: string
  auditTime: string
  auditRemark: string
  torder: number
  isRecommend: 1 | 2
  isEnable: 1 | 2
  createTime: string
  updateTime: string
}

/** 活动新增 DTO(文档 5.3) */
export interface IActivityAddReq {
  name: string
  poster?: string
  detailPoster?: string
  sponsorName?: string
  cateCode?: string
  cateName?: string
  describes?: string
  content?: string
  address?: string
  isCharge?: 1 | 2
  salePrice?: number
  startTime: string
  endTime: string
  torder?: number
  isRecommend?: 1 | 2
  isEnable?: 1 | 2
}

/** 活动更新 DTO(继承 Add,增加 uniqueCode) */
export interface IActivityUpdateReq extends IActivityAddReq {
  uniqueCode: string
}

/** 活动分页查询参数 */
export interface IActivityPageQuery extends IPageQuery {
  keyword?: string
}

/** 获取活动分页列表 */
export function useGetActivityPageQuery(merchantId: Ref<string>, query: Ref<IActivityPageQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IResponse<IPageResult<IActivityResp>>, Error>({
    queryKey: merchantBusinessKey('activity', merchantId.value, 'page', query),
    queryFn: async () => await apiFetch<IResponse<IPageResult<IActivityResp>>>(`${merchantModulePath('activity', merchantId.value)}/page`, {
      method: 'get',
      query: query.value,
    }),
    enabled: () => !!merchantId.value,
    retry: false,
  })
}

/** 获取活动详情 */
export function useGetActivityDetailQuery(merchantId: Ref<string>, activityCode: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IResponse<IActivityResp>, Error>({
    queryKey: merchantBusinessKey('activity', merchantId.value, 'detail', activityCode),
    queryFn: async () => await apiFetch<IResponse<IActivityResp>>(`${merchantModulePath('activity', merchantId.value)}/detail`, {
      method: 'get',
      query: { activityCode: activityCode.value },
    }),
    enabled: () => (enabled?.value ?? true) && !!merchantId.value && !!activityCode.value,
    retry: false,
  })
}

/** 新增活动 */
export function useCreateActivityMutation(merchantId: Ref<string>) {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<string>, Error, IActivityAddReq>({
    mutationKey: ['merchantBusiness', 'activity', 'create'],
    mutationFn: async data => await apiFetch<IResponse<string>>(merchantModulePath('activity', merchantId.value), {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantBusiness', 'activity'] })
    },
  })
}

/** 更新活动 */
export function useUpdateActivityMutation(merchantId: Ref<string>) {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IActivityUpdateReq>({
    mutationKey: ['merchantBusiness', 'activity', 'update'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>(merchantModulePath('activity', merchantId.value), {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantBusiness', 'activity'] })
    },
  })
}

/** 删除活动(路径参数名为 activityCode) */
export function useDeleteActivityMutation(merchantId: Ref<string>) {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['merchantBusiness', 'activity', 'delete'],
    mutationFn: async activityCode => await apiFetch<IResponse<boolean>>(`${merchantModulePath('activity', merchantId.value)}/${activityCode}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantBusiness', 'activity'] })
    },
  })
}

// ==================== 六、订单 ====================

/** 订单状态:2=已完成,3=待付款,4=已退款 */
export type OrderStatusType = 2 | 3 | 4

/** 订单列表 VO(文档 6.1) */
export interface IOrderListVO {
  orderid: string
  customerName: string
  goodsDesc: string
  price: number
  payWay: number
  payWayLabel: string
  statusType: OrderStatusType
  statusLabel: string
  createTime: string
}

/** 订单详情 VO(文档 6.2) */
export interface IOrderDetailVO {
  orderid: string
  customerName: string
  price: number
  goodsDesc: string
  createTime: string
  payTime: string
  payWay: number
  payWayLabel: string
  statusType: OrderStatusType
  statusLabel: string
}

/** 订单分页查询参数 */
export interface IOrderPageQuery extends IPageQuery {
  statusType?: OrderStatusType
  keyword?: string
}

/** 获取订单分页列表 */
export function useGetOrderPageQuery(merchantId: Ref<string>, query: Ref<IOrderPageQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IResponse<IPageResult<IOrderListVO>>, Error>({
    queryKey: merchantBusinessKey('order', merchantId.value, 'page', query),
    queryFn: async () => await apiFetch<IResponse<IPageResult<IOrderListVO>>>(`${merchantModulePath('order', merchantId.value)}/page`, {
      method: 'get',
      query: query.value,
    }),
    enabled: () => !!merchantId.value,
    retry: false,
  })
}

/** 获取订单详情 */
export function useGetOrderDetailQuery(merchantId: Ref<string>, orderid: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IResponse<IOrderDetailVO>, Error>({
    queryKey: merchantBusinessKey('order', merchantId.value, 'detail', orderid),
    queryFn: async () => await apiFetch<IResponse<IOrderDetailVO>>(`${merchantModulePath('order', merchantId.value)}/detail`, {
      method: 'get',
      query: { orderid: orderid.value },
    }),
    enabled: () => (enabled?.value ?? true) && !!merchantId.value && !!orderid.value,
    retry: false,
  })
}
