import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

// ==================== 类型 ====================

/** 内容类型:1=文本,2=外部链接 */
export type NoticeContentType = 1 | 2
/** 是否公有:1=公有,2=私有 */
export type NoticePublicStatus = 1 | 2

/** 内容类型映射配置 */
export const noticeContentTypeConfig: Record<NoticeContentType, { label: string, variant: 'default' | 'info' }> = {
  1: { label: '文本', variant: 'default' },
  2: { label: '链接', variant: 'info' },
}

/** 是否公有映射配置 */
export const noticePublicStatusConfig: Record<NoticePublicStatus, { label: string, variant: 'success' | 'secondary' }> = {
  1: { label: '公有', variant: 'success' },
  2: { label: '私有', variant: 'secondary' },
}

/** 分页列表查询参数(对接文档 9 节) */
export interface ICommunityNoticeListQuery extends IPageParam {
  /** 关键词(模糊搜索) */
  keyword?: string
}

/**
 * 社区公告 VO(对接文档 9 节 CommunityNoticeVO)。
 * 注意:列表 VO 含 poster(封面图),但新增/更新 body 不含 poster(已与后端确认去除)。
 */
export interface ICommunityNotice {
  /** 主键ID */
  id: number
  /** 唯一标识 */
  uniqueCode: string
  /** 标题 */
  title: string
  /** 封面图(只读展示,body 不可写) */
  poster?: string
  /** 简介 */
  introduction?: string
  /** 内容 */
  content?: string
  /** 内容类型:1=文本,2=外部链接 */
  contentType?: NoticeContentType
  /** 跳转链接 */
  h5Url?: string
  /** 是否公有:1=公有,2=私有 */
  isPublic?: NoticePublicStatus
  /** 公告关联的内容编码 */
  resCode?: string
  /** 排序 */
  torder?: number
  /** 合伙人标识(后端填充) */
  partnerId?: string
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  updateTime?: string
}

/**
 * 新增请求体(对接文档 9 节)。
 * 注意:不含 poster(后端已确认公告无封面图能力)。
 */
export interface ICommunityNoticeAddDTO {
  /** 标题 */
  title: string
  /** 简介 */
  introduction?: string
  /** 内容(contentType=1 时) */
  content?: string
  /** 内容类型:1=文本,2=外部链接 */
  contentType?: NoticeContentType
  /** 跳转链接(contentType=2 时) */
  h5Url?: string
  /** 是否公有:1=公有,2=私有 */
  isPublic?: NoticePublicStatus
  /** 关联内容编码 */
  resCode?: string
  /** 排序 */
  torder?: number
}

/** 更新请求体 = 新增 + uniqueCode */
export interface ICommunityNoticeUpdateDTO extends ICommunityNoticeAddDTO {
  /** 唯一标识 */
  uniqueCode: string
}

/** 分页列表响应 */
export type ICommunityNoticeListResponse = IResponse<IPageResult<ICommunityNotice>>

/** 详情响应(与列表项字段一致;详情接口为 ?uniqueCode= 查询参数) */
export type ICommunityNoticeDetailResponse = IResponse<ICommunityNotice>

// ==================== API 封装 ====================

/** 获取小区公告分页列表 */
export function useGetNoticePageQuery(query: Ref<ICommunityNoticeListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ICommunityNoticeListResponse, Error>({
    queryKey: ['communityNoticeList', query],
    queryFn: async () => await apiFetch<ICommunityNoticeListResponse>('/community/notice/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 获取小区公告详情 */
export function useGetNoticeDetailQuery(uniqueCode: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ICommunityNoticeDetailResponse, Error>({
    queryKey: ['communityNoticeDetail', uniqueCode],
    queryFn: async () => await apiFetch<ICommunityNoticeDetailResponse>('/community/notice/detail', {
      method: 'get',
      query: { uniqueCode: uniqueCode.value },
    }),
    enabled: () => (enabled?.value ?? true) && !!uniqueCode.value,
    retry: false,
  })
}

/** 新增小区公告 */
export function useCreateNoticeMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, ICommunityNoticeAddDTO>({
    mutationKey: ['createCommunityNotice'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/community/notice', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityNoticeList'] })
    },
  })
}

/** 更新小区公告 */
export function useUpdateNoticeMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, ICommunityNoticeUpdateDTO>({
    mutationKey: ['updateCommunityNotice'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/community/notice', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityNoticeList'] })
      queryClient.invalidateQueries({ queryKey: ['communityNoticeDetail'] })
    },
  })
}

/** 删除小区公告 */
export function useDeleteNoticeMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deleteCommunityNotice'],
    mutationFn: async uniqueCode => await apiFetch<IResponse<boolean>>(`/community/notice/${uniqueCode}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityNoticeList'] })
    },
  })
}
