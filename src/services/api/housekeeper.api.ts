import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

// ==================== 公共类型 ====================

/** 通用启停(对接文档 14 节):1=启用,2=禁用 */
export type HousekeeperEnableStatus = 1 | 2

/** 启用状态映射配置 */
export const housekeeperEnableStatusConfig: Record<HousekeeperEnableStatus, { label: string, variant: 'default' | 'secondary' }> = {
  1: { label: '启用', variant: 'default' },
  2: { label: '禁用', variant: 'secondary' },
}

// =====================================================================
// 4.1 管家服务主体 `/housekeeper/service`
// =====================================================================

/** 管家服务主体 VO(对接文档 4.1 HousekeeperServiceVO) */
export interface IHousekeeperService {
  /** 管家服务ID */
  housekeeperId: string
  /** 站长ID */
  stationId?: number
  /** 名称 */
  name: string
  /** 描述 */
  description?: string
  /** 图标 */
  icon?: string
  /** 封面图 */
  coverImage?: string
  /** 联系人 */
  contactName?: string
  /** 联系电话 */
  contactPhone?: string
  /** 商户ID */
  merchantId?: string
  /** 排序 */
  sortOrder?: number
  /** 启用状态:1=启用,2=禁用 */
  status?: HousekeeperEnableStatus
  /** 服务人员数 */
  staffCount?: number
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  updateTime?: string
}

/** 主体分页查询参数(对接文档 4.1) */
export interface IHousekeeperServiceListQuery extends IPageParam {
  /** 名称 */
  name?: string
  /** 状态:1=启用,2=禁用 */
  status?: HousekeeperEnableStatus
}

/** 主体新增/更新请求体(对接文档 4.1) */
export interface IHousekeeperServiceSaveDTO {
  /** 管家服务ID(更新必填) */
  housekeeperId?: string
  /** 名称 */
  name: string
  /** 描述 */
  description?: string
  /** 图标 */
  icon?: string
  /** 封面图 */
  coverImage?: string
  /** 联系人 */
  contactName?: string
  /** 联系电话 */
  contactPhone?: string
  /** 商户ID */
  merchantId?: string
  /** 排序 */
  sortOrder?: number
  /** 启用状态:1=启用,2=禁用 */
  status?: HousekeeperEnableStatus
}

/** 主体分页响应 */
export type IHousekeeperServiceListResponse = IResponse<IPageResult<IHousekeeperService>>
/** 主体启用列表响应(下拉用) */
export type IHousekeeperServiceListAllResponse = IResponse<IHousekeeperService[]>
/** 主体详情响应 */
export type IHousekeeperServiceDetailResponse = IResponse<IHousekeeperService>

/** 获取管家服务主体分页列表(对接文档 4.1,`/housekeeper/service/page`) */
export function useGetHousekeeperServicePageQuery(query: Ref<IHousekeeperServiceListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IHousekeeperServiceListResponse, Error>({
    queryKey: ['housekeeperServiceList', query],
    queryFn: async () => await apiFetch<IHousekeeperServiceListResponse>('/housekeeper/service/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 获取启用管家服务列表(下拉用,对接文档 4.1,`/housekeeper/service/list`) */
export function useGetHousekeeperServiceListQuery() {
  const { apiFetch } = useApiFetch()

  return useQuery<IHousekeeperServiceListAllResponse, Error>({
    queryKey: ['housekeeperServiceAll'],
    queryFn: async () => await apiFetch<IHousekeeperServiceListAllResponse>('/housekeeper/service/list'),
    retry: false,
  })
}

/** 获取管家服务主体详情(对接文档 4.1,`/housekeeper/service/{housekeeperId}`) */
export function useGetHousekeeperServiceDetailQuery(housekeeperId: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IHousekeeperServiceDetailResponse, Error>({
    queryKey: ['housekeeperServiceDetail', housekeeperId],
    queryFn: async () => await apiFetch<IHousekeeperServiceDetailResponse>(`/housekeeper/service/${housekeeperId.value}`),
    enabled: () => (enabled?.value ?? true) && housekeeperId.value !== undefined,
    retry: false,
  })
}

/** 新增管家服务主体(对接文档 4.1,`POST /housekeeper/service`) */
export function useCreateHousekeeperServiceMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IHousekeeperServiceSaveDTO>({
    mutationKey: ['createHousekeeperService'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/housekeeper/service', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeperServiceList'] })
      queryClient.invalidateQueries({ queryKey: ['housekeeperServiceAll'] })
    },
  })
}

/** 更新管家服务主体(对接文档 4.1,`PUT /housekeeper/service`) */
export function useUpdateHousekeeperServiceMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IHousekeeperServiceSaveDTO>({
    mutationKey: ['updateHousekeeperService'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/housekeeper/service', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeperServiceList'] })
      queryClient.invalidateQueries({ queryKey: ['housekeeperServiceAll'] })
      queryClient.invalidateQueries({ queryKey: ['housekeeperServiceDetail'] })
    },
  })
}

/** 启停管家服务主体(对接文档 4.1,`PUT /housekeeper/service/{housekeeperId}/status?status=`) */
export function useUpdateHousekeeperServiceStatusMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, { housekeeperId: string, status: HousekeeperEnableStatus }>({
    mutationKey: ['updateHousekeeperServiceStatus'],
    mutationFn: async ({ housekeeperId, status }) => await apiFetch<IResponse<boolean>>(`/housekeeper/service/${housekeeperId}/status`, {
      method: 'put',
      query: { status },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeperServiceList'] })
      queryClient.invalidateQueries({ queryKey: ['housekeeperServiceAll'] })
    },
  })
}

/** 删除管家服务主体(对接文档 4.1,`DELETE /housekeeper/service/{housekeeperId}`) */
export function useDeleteHousekeeperServiceMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deleteHousekeeperService'],
    mutationFn: async housekeeperId => await apiFetch<IResponse<boolean>>(`/housekeeper/service/${housekeeperId}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeperServiceList'] })
      queryClient.invalidateQueries({ queryKey: ['housekeeperServiceAll'] })
    },
  })
}

// =====================================================================
// 4.2 服务人员 `/housekeeper/staff`
// =====================================================================

/** 服务人员 VO(对接文档 4.2 HousekeeperStaffVO) */
export interface IHousekeeperStaff {
  /** 人员ID */
  staffId: string
  /** 管家服务ID */
  housekeeperId: string
  /** 管家服务名称 */
  housekeeperName?: string
  /** 站长ID */
  stationId?: number
  /** 人员姓名 */
  staffName: string
  /** 手机 */
  phone?: string
  /** 头像 */
  avatar?: string
  /** 职称 */
  title?: string
  /** 用户ID */
  userId?: number
  /** 排序 */
  sortOrder?: number
  /** 启用状态:1=启用,2=禁用 */
  status?: HousekeeperEnableStatus
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  updateTime?: string
}

/** 人员分页查询参数(对接文档 4.2) */
export interface IHousekeeperStaffListQuery extends IPageParam {
  /** 管家服务ID */
  housekeeperId?: string
  /** 人员姓名 */
  staffName?: string
  /** 状态:1=启用,2=禁用 */
  status?: HousekeeperEnableStatus
}

/** 人员新增/更新请求体(对接文档 4.2) */
export interface IHousekeeperStaffSaveDTO {
  /** 人员ID(更新必填) */
  staffId?: string
  /** 管家服务ID */
  housekeeperId: string
  /** 人员姓名 */
  staffName: string
  /** 手机 */
  phone?: string
  /** 头像 */
  avatar?: string
  /** 职称 */
  title?: string
  /** 用户ID */
  userId?: number
  /** 排序 */
  sortOrder?: number
  /** 启用状态:1=启用,2=禁用 */
  status?: HousekeeperEnableStatus
}

/** 人员分页响应 */
export type IHousekeeperStaffListResponse = IResponse<IPageResult<IHousekeeperStaff>>
/** 人员启用列表响应(对接文档 4.2,`/housekeeper/staff/list?housekeeperId=`) */
export type IHousekeeperStaffListAllResponse = IResponse<IHousekeeperStaff[]>
/** 人员详情响应 */
export type IHousekeeperStaffDetailResponse = IResponse<IHousekeeperStaff>

/** 获取服务人员分页列表(对接文档 4.2,`/housekeeper/staff/page`) */
export function useGetHousekeeperStaffPageQuery(query: Ref<IHousekeeperStaffListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IHousekeeperStaffListResponse, Error>({
    queryKey: ['housekeeperStaffList', query],
    queryFn: async () => await apiFetch<IHousekeeperStaffListResponse>('/housekeeper/staff/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 获取某管家服务下启用人员列表(对接文档 4.2,`/housekeeper/staff/list?housekeeperId=`) */
export function useGetHousekeeperStaffListQuery(housekeeperId: Ref<string | undefined>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IHousekeeperStaffListAllResponse, Error>({
    queryKey: ['housekeeperStaffAll', housekeeperId],
    queryFn: async () => await apiFetch<IHousekeeperStaffListAllResponse>('/housekeeper/staff/list', {
      method: 'get',
      query: { housekeeperId: housekeeperId.value },
    }),
    enabled: () => housekeeperId.value !== undefined,
    retry: false,
  })
}

/** 获取服务人员详情(对接文档 4.2,`/housekeeper/staff/{staffId}`) */
export function useGetHousekeeperStaffDetailQuery(staffId: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IHousekeeperStaffDetailResponse, Error>({
    queryKey: ['housekeeperStaffDetail', staffId],
    queryFn: async () => await apiFetch<IHousekeeperStaffDetailResponse>(`/housekeeper/staff/${staffId.value}`),
    enabled: () => (enabled?.value ?? true) && staffId.value !== undefined,
    retry: false,
  })
}

/** 新增服务人员(对接文档 4.2,`POST /housekeeper/staff`) */
export function useCreateHousekeeperStaffMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IHousekeeperStaffSaveDTO>({
    mutationKey: ['createHousekeeperStaff'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/housekeeper/staff', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeperStaffList'] })
      queryClient.invalidateQueries({ queryKey: ['housekeeperStaffAll'] })
    },
  })
}

/** 更新服务人员(对接文档 4.2,`PUT /housekeeper/staff`) */
export function useUpdateHousekeeperStaffMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IHousekeeperStaffSaveDTO>({
    mutationKey: ['updateHousekeeperStaff'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/housekeeper/staff', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeperStaffList'] })
      queryClient.invalidateQueries({ queryKey: ['housekeeperStaffAll'] })
      queryClient.invalidateQueries({ queryKey: ['housekeeperStaffDetail'] })
    },
  })
}

/** 启停服务人员(对接文档 4.2,`PUT /housekeeper/staff/{staffId}/status?status=`) */
export function useUpdateHousekeeperStaffStatusMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, { staffId: string, status: HousekeeperEnableStatus }>({
    mutationKey: ['updateHousekeeperStaffStatus'],
    mutationFn: async ({ staffId, status }) => await apiFetch<IResponse<boolean>>(`/housekeeper/staff/${staffId}/status`, {
      method: 'put',
      query: { status },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeperStaffList'] })
      queryClient.invalidateQueries({ queryKey: ['housekeeperStaffAll'] })
    },
  })
}

/** 删除服务人员(对接文档 4.2,`DELETE /housekeeper/staff/{staffId}`) */
export function useDeleteHousekeeperStaffMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deleteHousekeeperStaff'],
    mutationFn: async staffId => await apiFetch<IResponse<boolean>>(`/housekeeper/staff/${staffId}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeperStaffList'] })
      queryClient.invalidateQueries({ queryKey: ['housekeeperStaffAll'] })
    },
  })
}

// =====================================================================
// 4.3 服务分类 `/housekeeper/category`
// =====================================================================

/** 服务分类 VO(对接文档 4.3 ServiceCategoryVO) */
export interface IHousekeeperCategory {
  /** 分类ID */
  categoryId: string
  /** 分类名称 */
  categoryName: string
  /** 分类编码 */
  categoryCode?: string
  /** 图标 */
  icon?: string
  /** 描述 */
  description?: string
  /** 排序 */
  sortOrder?: number
  /** 启用状态:1=启用,2=禁用 */
  status?: HousekeeperEnableStatus
  /** 站长ID */
  stationId?: number
  /** 供应商数量 */
  providerCount?: number
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  updateTime?: string
}

/** 分类新增/更新请求体(对接文档 4.3) */
export interface IHousekeeperCategorySaveDTO {
  /** 分类ID(更新必填) */
  categoryId?: string
  /** 分类名称 */
  categoryName: string
  /** 分类编码 */
  categoryCode?: string
  /** 图标 */
  icon?: string
  /** 描述 */
  description?: string
  /** 排序 */
  sortOrder?: number
  /** 启用状态:1=启用,2=禁用 */
  status?: HousekeeperEnableStatus
}

/** 分类分页查询参数(对接文档 4.3) */
export interface IHousekeeperCategoryListQuery extends IPageParam {
  /** 分类名称 */
  categoryName?: string
  /** 状态:1=启用,2=禁用 */
  status?: HousekeeperEnableStatus
}

/** 分类分页响应 */
export type IHousekeeperCategoryListResponse = IResponse<IPageResult<IHousekeeperCategory>>
/** 分类启用列表响应(下拉用) */
export type IHousekeeperCategoryListAllResponse = IResponse<IHousekeeperCategory[]>
/** 分类详情响应 */
export type IHousekeeperCategoryDetailResponse = IResponse<IHousekeeperCategory>

/** 获取服务分类分页列表(对接文档 4.3,`/housekeeper/category/page`) */
export function useGetHousekeeperCategoryPageQuery(query: Ref<IHousekeeperCategoryListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IHousekeeperCategoryListResponse, Error>({
    queryKey: ['housekeeperCategoryList', query],
    queryFn: async () => await apiFetch<IHousekeeperCategoryListResponse>('/housekeeper/category/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 获取启用服务分类列表(下拉用,对接文档 4.3,`/housekeeper/category/list`) */
export function useGetHousekeeperCategoryListQuery() {
  const { apiFetch } = useApiFetch()

  return useQuery<IHousekeeperCategoryListAllResponse, Error>({
    queryKey: ['housekeeperCategoryAll'],
    queryFn: async () => await apiFetch<IHousekeeperCategoryListAllResponse>('/housekeeper/category/list'),
    retry: false,
  })
}

/** 获取服务分类详情(对接文档 4.3,`/housekeeper/category/{categoryId}`) */
export function useGetHousekeeperCategoryDetailQuery(categoryId: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IHousekeeperCategoryDetailResponse, Error>({
    queryKey: ['housekeeperCategoryDetail', categoryId],
    queryFn: async () => await apiFetch<IHousekeeperCategoryDetailResponse>(`/housekeeper/category/${categoryId.value}`),
    enabled: () => (enabled?.value ?? true) && categoryId.value !== undefined,
    retry: false,
  })
}

/** 新增服务分类(对接文档 4.3,`POST /housekeeper/category`) */
export function useCreateHousekeeperCategoryMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IHousekeeperCategorySaveDTO>({
    mutationKey: ['createHousekeeperCategory'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/housekeeper/category', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeperCategoryList'] })
      queryClient.invalidateQueries({ queryKey: ['housekeeperCategoryAll'] })
    },
  })
}

/** 更新服务分类(对接文档 4.3,`PUT /housekeeper/category`) */
export function useUpdateHousekeeperCategoryMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IHousekeeperCategorySaveDTO>({
    mutationKey: ['updateHousekeeperCategory'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/housekeeper/category', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeperCategoryList'] })
      queryClient.invalidateQueries({ queryKey: ['housekeeperCategoryAll'] })
      queryClient.invalidateQueries({ queryKey: ['housekeeperCategoryDetail'] })
    },
  })
}

/** 启停服务分类(对接文档 4.3,`PUT /housekeeper/category/{categoryId}/status?status=`) */
export function useUpdateHousekeeperCategoryStatusMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, { categoryId: string, status: HousekeeperEnableStatus }>({
    mutationKey: ['updateHousekeeperCategoryStatus'],
    mutationFn: async ({ categoryId, status }) => await apiFetch<IResponse<boolean>>(`/housekeeper/category/${categoryId}/status`, {
      method: 'put',
      query: { status },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeperCategoryList'] })
      queryClient.invalidateQueries({ queryKey: ['housekeeperCategoryAll'] })
    },
  })
}

/** 删除服务分类(对接文档 4.3,`DELETE /housekeeper/category/{categoryId}`) */
export function useDeleteHousekeeperCategoryMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deleteHousekeeperCategory'],
    mutationFn: async categoryId => await apiFetch<IResponse<boolean>>(`/housekeeper/category/${categoryId}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeperCategoryList'] })
      queryClient.invalidateQueries({ queryKey: ['housekeeperCategoryAll'] })
    },
  })
}

// =====================================================================
// 4.4 分类分配人员 `/housekeeper/category/providers`
// 说明:仅支持全量覆盖分配(PUT),无单条新增;空数组=清空该分类下所有分配。
// =====================================================================

/** 分配项(单个人员分配) */
export interface IHousekeeperCategoryProvider {
  /** 管家服务ID */
  housekeeperId: string
  /** 人员ID */
  staffId?: string
  /** 排序 */
  sortOrder?: number
}

/** 全量覆盖分配请求体(对接文档 4.4) */
export interface IHousekeeperCategoryProvidersSaveDTO {
  /** 分类ID */
  categoryId: string
  /** 分配列表(空数组=清空) */
  providers: IHousekeeperCategoryProvider[]
}

/** 分类已分配人员 VO(对接文档 4.4 CategoryProviderVO) */
export interface IHousekeeperCategoryProviderVO {
  /** 分配记录ID */
  id: string
  /** 分类ID */
  categoryId: string
  /** 管家服务ID */
  housekeeperId: string
  /** 管家服务名称 */
  housekeeperName?: string
  /** 人员ID */
  staffId?: string
  /** 人员名称 */
  staffName?: string
  /** 排序 */
  sortOrder?: number
  /** 启用状态:1=启用,2=禁用 */
  status?: HousekeeperEnableStatus
}

/** 已分配列表响应 */
export type IHousekeeperCategoryProvidersResponse = IResponse<IHousekeeperCategoryProviderVO[]>

/** 获取分类已分配人员列表(对接文档 4.4,`/housekeeper/category/{categoryId}/providers`) */
export function useGetHousekeeperCategoryProvidersQuery(categoryId: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IHousekeeperCategoryProvidersResponse, Error>({
    queryKey: ['housekeeperCategoryProviders', categoryId],
    queryFn: async () => await apiFetch<IHousekeeperCategoryProvidersResponse>(`/housekeeper/category/${categoryId.value}/providers`),
    enabled: () => (enabled?.value ?? true) && categoryId.value !== undefined,
    retry: false,
  })
}

/** 全量覆盖分类人员分配(对接文档 4.4,`PUT /housekeeper/category/providers`) */
export function useSaveHousekeeperCategoryProvidersMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IHousekeeperCategoryProvidersSaveDTO>({
    mutationKey: ['saveHousekeeperCategoryProviders'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/housekeeper/category/providers', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeperCategoryProviders'] })
      queryClient.invalidateQueries({ queryKey: ['housekeeperCategoryList'] })
    },
  })
}

/** 删除单条分配(对接文档 4.4,`DELETE /housekeeper/category/providers/{id}`) */
export function useDeleteHousekeeperCategoryProviderMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, number>({
    mutationKey: ['deleteHousekeeperCategoryProvider'],
    mutationFn: async id => await apiFetch<IResponse<boolean>>(`/housekeeper/category/providers/${id}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeperCategoryProviders'] })
      queryClient.invalidateQueries({ queryKey: ['housekeeperCategoryList'] })
    },
  })
}
