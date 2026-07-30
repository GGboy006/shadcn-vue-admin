import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IResponse } from '../types/response.type'

/** 审核状态：0=待审核，1=审核拒绝，2=审核通过 */
export type DynamicAuditStatus = 0 | 1 | 2

/** 启用状态：1=启用，2=禁用 */
export type DynamicEnableStatus = 1 | 2

/** 审核状态映射配置 */
export const dynamicAuditStatusConfig: Record<DynamicAuditStatus, { label: string, variant: 'warning' | 'destructive' | 'success' }> = {
  0: { label: '待审核', variant: 'warning' },
  1: { label: '审核拒绝', variant: 'destructive' },
  2: { label: '审核通过', variant: 'success' },
}

/** 启用状态映射配置 */
export const dynamicEnableStatusConfig: Record<DynamicEnableStatus, { label: string, variant: 'default' | 'secondary' }> = {
  1: { label: '启用', variant: 'default' },
  2: { label: '禁用', variant: 'secondary' },
}

/** 分页列表查询参数 */
export interface ICommunityDynamicListQuery {
  /** 关键词（模糊搜索） */
  keyword?: string
  /** 页码 */
  pageNum: number
  /** 每页数量 */
  pageSize: number
  /** 是否查询总条数 */
  searchCount?: string
  /** 排序字段集合 */
  sortItemList?: string
}

/** 社区动态 VO */
export interface ICommunityDynamic {
  /** 主键ID */
  id: number
  /** 唯一标识 */
  uniqueCode: string
  /** 封面图 */
  poster?: string
  /** 标题 */
  title: string
  /** 内容 */
  content?: string
  /** 来源 */
  original?: string
  /** 关键词，英文逗号隔开 */
  keywords?: string
  /** 作者名称 */
  userName?: string
  /** 作者头像 */
  userPoster?: string
  /** 作者唯一标识 */
  userUniqueCode?: string
  /** 文章来源网址 */
  sourceUrl?: string
  /** 审核状态：0=待审核，1=审核拒绝，2=审核通过 */
  auditStatus?: DynamicAuditStatus
  /** 启用状态：1=启用，2=禁用 */
  isEnable?: DynamicEnableStatus
  /** 是否删除：1=已删除 */
  isDeleted?: number
  /** 文章介绍 */
  describes?: string
  /** 审核描述 */
  auditMsg?: string
  /** 社区唯一标识 */
  communityUniqueCode?: string
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  operatorTime?: string
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

/** 新增请求体 */
export interface ICommunityDynamicAddDTO {
  /** 标题 */
  title: string
  /** 封面图 */
  poster?: string
  /** 内容 */
  content?: string
  /** 来源 */
  original?: string
  /** 关键词，英文逗号隔开 */
  keywords?: string
  /** 作者名称 */
  userName?: string
  /** 作者头像 */
  userPoster?: string
  /** 文章来源网址 */
  sourceUrl?: string
  /** 启用状态：1=启用，2=禁用 */
  isEnable?: DynamicEnableStatus
  /** 文章介绍 */
  describes?: string
}

/** 更新请求体（在新增基础上增加 uniqueCode） */
export interface ICommunityDynamicUpdateDTO extends ICommunityDynamicAddDTO {
  /** 唯一标识 */
  uniqueCode: string
}

/** 分页列表响应 */
export type ICommunityDynamicListResponse = IResponse<IPageResult<ICommunityDynamic>>

/** 详情响应 */
export type ICommunityDynamicDetailResponse = IResponse<ICommunityDynamic>

// ==================== API 封装 ====================

/** 获取小区动态分页列表 */
export function useGetDynamicPageQuery(query: Ref<ICommunityDynamicListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ICommunityDynamicListResponse, Error>({
    queryKey: ['communityDynamicList', query],
    queryFn: async () => await apiFetch<ICommunityDynamicListResponse>('/community/dynamic/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 获取小区动态详情 */
export function useGetDynamicDetailQuery(uniqueCode: Ref<string | undefined>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ICommunityDynamicDetailResponse, Error>({
    queryKey: ['communityDynamicDetail', uniqueCode],
    queryFn: async () => await apiFetch<ICommunityDynamicDetailResponse>('/community/dynamic/detail', {
      method: 'get',
      query: { uniqueCode: uniqueCode.value },
    }),
    enabled: () => !!uniqueCode.value,
    retry: false,
  })
}

/** 新增小区动态 */
export function useCreateDynamicMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, ICommunityDynamicAddDTO>({
    mutationKey: ['createCommunityDynamic'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/community/dynamic', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityDynamicList'] })
    },
  })
}

/** 更新小区动态 */
export function useUpdateDynamicMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, ICommunityDynamicUpdateDTO>({
    mutationKey: ['updateCommunityDynamic'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/community/dynamic', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityDynamicList'] })
      queryClient.invalidateQueries({ queryKey: ['communityDynamicDetail'] })
    },
  })
}

/** 删除小区动态 */
export function useDeleteDynamicMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deleteCommunityDynamic'],
    mutationFn: async uniqueCode => await apiFetch<IResponse<boolean>>(`/community/dynamic/${uniqueCode}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityDynamicList'] })
    },
  })
}
