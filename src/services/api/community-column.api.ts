import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

// ==================== 类型 ====================

/**
 * 栏目类型(对接文档 14 节 / 枚举速查 · 小区栏目 type)。
 * 注意:与居委会栏目(unified)取值集合完全不同,这是站长侧小区栏目专属枚举。
 */
export type CommunityColumnType
  = | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 57
    | 84
    | 87
    | 88
    | 89

/** 启用状态:1=启用,2=禁用 */
export type CommunityColumnEnableStatus = 1 | 2

/** 栏目类型映射配置(对接文档 14 节) */
export const communityColumnTypeConfig: Record<CommunityColumnType, { label: string }> = {
  1: { label: '社区公告' },
  2: { label: '办事指南' },
  3: { label: 'AI客服' },
  4: { label: '社区周边' },
  5: { label: '读书会' },
  6: { label: '百度小程序' },
  7: { label: '微信小程序' },
  8: { label: '社区动态' },
  57: { label: '居委会' },
  84: { label: 'AI百事通' },
  87: { label: '社区动态详情' },
  88: { label: '社区分栏' },
  89: { label: '全民阅读' },
}

/** 启用状态映射配置 */
export const communityColumnEnableStatusConfig: Record<CommunityColumnEnableStatus, { label: string, variant: 'default' | 'secondary' }> = {
  1: { label: '启用', variant: 'default' },
  2: { label: '禁用', variant: 'secondary' },
}

/** 分页列表查询参数(对接文档 11 节) */
export interface ICommunityColumnListQuery extends IPageParam {
  /** 关键词(模糊搜索) */
  keyword?: string
}

/** 小区栏目 VO(对接文档 11 节 TblCommunityColumnResp) */
export interface ICommunityColumn {
  /** 主键ID */
  id: number
  /** 唯一标识 */
  uniqueCode: string
  /** 名称 */
  name: string
  /** logo */
  logo?: string
  /** 排序 */
  torder?: number
  /** 启用状态:1=启用,2=禁用 */
  isEnable?: CommunityColumnEnableStatus
  /** 栏目类型(见枚举) */
  type?: CommunityColumnType
  /** 小程序 appId */
  appId?: string
  /** 阅览室编码 */
  readingCode?: string
  /** H5 地址 */
  h5Url?: string
  /** 其他标识(后端已在 page 返回中补充) */
  resCode?: string
  /** 合伙人标识(后端填充) */
  partnerId?: string
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  updateTime?: string
}

/**
 * 新增请求体(对接文档 11 节)。
 */
export interface ICommunityColumnAddDTO {
  /** 名称 */
  name: string
  /** logo */
  logo?: string
  /** 栏目类型(见枚举) */
  type?: CommunityColumnType
  /** 排序 */
  torder?: number
  /** 启用状态:1=启用,2=禁用 */
  isEnable?: CommunityColumnEnableStatus
  /** 小程序 appId */
  appId?: string
  /** 阅览室编码 */
  readingCode?: string
  /** H5 地址 */
  h5Url?: string
  /** 其他标识 */
  resCode?: string
}

/** 更新请求体 = 新增 + uniqueCode */
export interface ICommunityColumnUpdateDTO extends ICommunityColumnAddDTO {
  /** 唯一标识 */
  uniqueCode: string
}

/** 分页列表响应 */
export type ICommunityColumnListResponse = IResponse<IPageResult<ICommunityColumn>>

// ==================== API 封装 ====================

/**
 * 获取小区栏目分页列表(对接文档 11 节,`/community/column/page`)。
 * 无独立 detail 接口,编辑表单用列表数据回填(列表返回即全字段)。
 */
export function useGetColumnPageQuery(query: Ref<ICommunityColumnListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ICommunityColumnListResponse, Error>({
    queryKey: ['communityColumnList', query],
    queryFn: async () => await apiFetch<ICommunityColumnListResponse>('/community/column/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 新增小区栏目 */
export function useCreateColumnMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, ICommunityColumnAddDTO>({
    mutationKey: ['createCommunityColumn'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/community/column', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityColumnList'] })
    },
  })
}

/** 更新小区栏目 */
export function useUpdateColumnMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, ICommunityColumnUpdateDTO>({
    mutationKey: ['updateCommunityColumn'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/community/column', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityColumnList'] })
    },
  })
}

/** 删除小区栏目 */
export function useDeleteColumnMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deleteCommunityColumn'],
    mutationFn: async uniqueCode => await apiFetch<IResponse<boolean>>(`/community/column/${uniqueCode}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityColumnList'] })
    },
  })
}
