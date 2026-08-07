import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

// ==================== 类型 ====================

/** 启用状态:1=启用,2=禁用 */
export type DynamicEnableStatus = 1 | 2

/** 启用状态映射配置 */
export const dynamicEnableStatusConfig: Record<DynamicEnableStatus, { label: string, variant: 'default' | 'secondary' }> = {
  1: { label: '启用', variant: 'default' },
  2: { label: '禁用', variant: 'secondary' },
}

/** 分页列表查询参数(对接文档 10 节) */
export interface ICommunityDynamicListQuery extends IPageParam {
  /** 关键词(模糊搜索) */
  keyword?: string
}

/** 小区动态 VO(对接文档 10 节 TblCommunityDynamicResp) */
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
  /** 关键词,英文逗号隔开 */
  keywords?: string
  /** 作者名称 */
  userName?: string
  /** 作者头像 */
  userPoster?: string
  /** 作者唯一标识 */
  userUniqueCode?: string
  /** 文章来源网址 */
  sourceUrl?: string
  /** 启用状态:1=启用,2=禁用 */
  isEnable?: DynamicEnableStatus
  /** 合伙人标识(后端填充) */
  partnerId?: string
  /** 合伙人父级标识 */
  partnerPid?: string
  /** 是否删除:1=已删除 */
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

/** 新增请求体(对接文档 10 节) */
export interface ICommunityDynamicAddDTO {
  /** 标题 */
  title: string
  /** 封面图 */
  poster?: string
  /** 内容 */
  content?: string
  /** 来源 */
  original?: string
  /** 关键词,英文逗号隔开 */
  keywords?: string
  /** 作者名称 */
  userName?: string
  /** 作者头像 */
  userPoster?: string
  /** 作者唯一标识 */
  userUniqueCode?: string
  /** 文章来源网址 */
  sourceUrl?: string
  /** 启用状态:1=启用,2=禁用 */
  isEnable?: DynamicEnableStatus
  /** 文章介绍 */
  describes?: string
  /** 审核描述 */
  auditMsg?: string
  /** 社区唯一标识 */
  communityUniqueCode?: string
}

/** 更新请求体 = 新增 + uniqueCode */
export interface ICommunityDynamicUpdateDTO extends ICommunityDynamicAddDTO {
  /** 唯一标识 */
  uniqueCode: string
}

/** 分页列表响应 */
export type ICommunityDynamicListResponse = IResponse<IPageResult<ICommunityDynamic>>

/** 详情响应(与列表项字段一致,无额外字段;无独立 detail 接口,编辑用列表数据回填) */
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
export function useGetDynamicDetailQuery(uniqueCode: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ICommunityDynamicDetailResponse, Error>({
    queryKey: ['communityDynamicDetail', uniqueCode],
    queryFn: async () => await apiFetch<ICommunityDynamicDetailResponse>('/community/dynamic/detail', {
      method: 'get',
      query: { uniqueCode: uniqueCode.value },
    }),
    enabled: () => (enabled?.value ?? true) && !!uniqueCode.value,
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
