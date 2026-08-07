import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

// ==================== 类型 ====================

/**
 * 小区分类 type(对接文档 14 节 / 枚举速查 · 小区分类 type)。
 * 用于下拉 `/community/cate/list?type=` 必填筛选。
 * 注意:居民 AI 工具分类(type=10)请优先使用 `/resident/ai-tool/cate/*`,后端已固定。
 */
export type CommunityCateType = 1 | 2 | 3 | 4 | 5 | 9 | 10

/** 启用状态:1=启用,2=禁用 */
export type CommunityCateEnableStatus = 1 | 2

/** 小区分类 type 映射配置(对接文档 14 节) */
export const communityCateTypeConfig: Record<CommunityCateType, { label: string }> = {
  1: { label: '社区服务' },
  2: { label: '居委会' },
  3: { label: '物业' },
  4: { label: '生活' },
  5: { label: '服务' },
  9: { label: '商品' },
  10: { label: 'AI助手' },
}

/** 启用状态映射配置 */
export const communityCateEnableStatusConfig: Record<CommunityCateEnableStatus, { label: string, variant: 'default' | 'secondary' }> = {
  1: { label: '启用', variant: 'default' },
  2: { label: '禁用', variant: 'secondary' },
}

/** 分页列表查询参数(对接文档 12 节) */
export interface ICommunityCateListQuery extends IPageParam {
  /** 关键词(模糊搜索) */
  keyword?: string
  /** 分类类型(可选过滤) */
  type?: CommunityCateType
}

/** 下拉列表查询参数(type 必填) */
export interface ICommunityCateDropdownQuery {
  /** 分类类型(必填):1社区服务/2居委会/3物业/4生活/5服务/9商品/10AI助手 */
  type: CommunityCateType
}

/** 小区分类 VO(对接文档 12 节 TblCommunityCateResp) */
export interface ICommunityCate {
  /** 唯一标识 */
  uniqueCode: string
  /** 父级编码 */
  parentCode?: string
  /** 名称 */
  name: string
  /** 描述 */
  describe?: string
  /** 排序 */
  torder?: number
  /** 分类类型 */
  type?: CommunityCateType
  /** 模板类型 */
  tempType?: number
  /** 启用状态:1=启用,2=禁用 */
  isEnable?: CommunityCateEnableStatus
  /** 合伙人标识(后端填充) */
  partnerId?: string
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  updateTime?: string
}

/** 新增请求体(对接文档 12 节) */
export interface ICommunityCateAddDTO {
  /** 名称 */
  name: string
  /** 父级编码 */
  parentCode?: string
  /** 描述 */
  describe?: string
  /** 排序 */
  torder?: number
  /** 分类类型 */
  type?: CommunityCateType
  /** 模板类型 */
  tempType?: number
  /** 启用状态:1=启用,2=禁用 */
  isEnable?: CommunityCateEnableStatus
}

/** 更新请求体 = 新增 + uniqueCode */
export interface ICommunityCateUpdateDTO extends ICommunityCateAddDTO {
  /** 唯一标识 */
  uniqueCode: string
}

/** 分页列表响应 */
export type ICommunityCateListResponse = IResponse<IPageResult<ICommunityCate>>

/** 下拉列表响应(启用项) */
export type ICommunityCateDropdownResponse = IResponse<ICommunityCate[]>

// ==================== API 封装 ====================

/**
 * 获取小区分类分页列表(对接文档 12 节,`/community/cate/page`)。
 * 无独立 detail 接口,编辑表单用列表数据回填(列表返回即全字段)。
 */
export function useGetCatePageQuery(query: Ref<ICommunityCateListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ICommunityCateListResponse, Error>({
    queryKey: ['communityCateList', query],
    queryFn: async () => await apiFetch<ICommunityCateListResponse>('/community/cate/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/**
 * 按类型获取启用分类下拉(对接文档 12 节,`/community/cate/list?type=`)。
 * type 必填,返回该类型下启用的分类,用于下拉选择。
 */
export function useGetCateListQuery(query: Ref<ICommunityCateDropdownQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ICommunityCateDropdownResponse, Error>({
    queryKey: ['communityCateDropdown', query],
    queryFn: async () => await apiFetch<ICommunityCateDropdownResponse>('/community/cate/list', {
      method: 'get',
      query: query.value,
    }),
    enabled: () => !!query.value.type,
    retry: false,
  })
}

/** 新增小区分类 */
export function useCreateCateMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, ICommunityCateAddDTO>({
    mutationKey: ['createCommunityCate'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/community/cate', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityCateList'] })
      queryClient.invalidateQueries({ queryKey: ['communityCateDropdown'] })
    },
  })
}

/** 更新小区分类 */
export function useUpdateCateMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, ICommunityCateUpdateDTO>({
    mutationKey: ['updateCommunityCate'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/community/cate', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityCateList'] })
      queryClient.invalidateQueries({ queryKey: ['communityCateDropdown'] })
    },
  })
}

/** 删除小区分类 */
export function useDeleteCateMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deleteCommunityCate'],
    mutationFn: async uniqueCode => await apiFetch<IResponse<boolean>>(`/community/cate/${uniqueCode}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityCateList'] })
      queryClient.invalidateQueries({ queryKey: ['communityCateDropdown'] })
    },
  })
}
