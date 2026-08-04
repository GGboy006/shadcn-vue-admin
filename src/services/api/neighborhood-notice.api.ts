import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

// ==================== 类型 ====================

/** 内容类型:1=文本,2=链接 */
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

/** 分页列表查询参数(对接文档 3.1) */
export interface INeighborhoodNoticeListQuery extends IPageParam {
  /** 关键词(模糊搜索) */
  keyword?: string
}

/** 居委会公告 VO(对接文档 3.1 CommunityNoticeVO) */
export interface INeighborhoodNotice {
  /** 主键ID */
  id: number
  /** 唯一标识 */
  uniqueCode: string
  /** 标题 */
  title: string
  /** 简介 */
  introduction?: string
  /** 正文(contentType=1 时的文本内容) */
  content?: string
  /** 内容类型:1=文本,2=链接 */
  contentType?: NoticeContentType
  /** 跳转链接 */
  h5Url?: string
  /** 是否公有:1=公有,2=私有 */
  isPublic?: NoticePublicStatus
  /** 公告关联的内容编码 */
  resCode?: string
  /** 排序 */
  torder?: number
  /** 合伙人标识 */
  partnerId?: string
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  updateTime?: string
}

/** 新增请求体(对接文档 3.1 CompanyNoticeAddReq) */
export interface INeighborhoodNoticeAddDTO {
  /** 标题 */
  title: string
  /** 封面图 */
  poster?: string
  /** 简介 */
  introduction?: string
  /** 内容类型:1=文本,2=链接 */
  contentType?: NoticeContentType
  /** 正文(文本时) */
  content?: string
  /** 跳转链接(链接时) */
  h5Url?: string
  /** 是否公有:1=公有,2=私有 */
  isPublic?: NoticePublicStatus
  /** 关联内容 */
  resCode?: string
  /** 排序 */
  torder?: number
}

/** 更新请求体 = 新增 + uniqueCode */
export interface INeighborhoodNoticeUpdateDTO extends INeighborhoodNoticeAddDTO {
  /** 唯一标识 */
  uniqueCode: string
}

/** 分页列表响应 */
export type INeighborhoodNoticeListResponse = IResponse<IPageResult<INeighborhoodNotice>>

/** 详情响应(与列表项字段一致,无额外字段) */
export type INeighborhoodNoticeDetailResponse = IResponse<INeighborhoodNotice>

// ==================== API 封装 ====================

/** 获取居委会公告分页列表 */
export function useGetNoticePageQuery(query: Ref<INeighborhoodNoticeListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<INeighborhoodNoticeListResponse, Error>({
    queryKey: ['neighborhoodNoticeList', query],
    queryFn: async () => await apiFetch<INeighborhoodNoticeListResponse>('/neighborhood/notice/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 获取居委会公告详情 */
export function useGetNoticeDetailQuery(uniqueCode: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<INeighborhoodNoticeDetailResponse, Error>({
    queryKey: ['neighborhoodNoticeDetail', uniqueCode],
    queryFn: async () => await apiFetch<INeighborhoodNoticeDetailResponse>('/neighborhood/notice/detail', {
      method: 'get',
      query: { uniqueCode: uniqueCode.value },
    }),
    // 默认仅 uniqueCode 有值即请求;组件层可传入更严格的 enabled(如弹层打开才请求),
    // 此时仍需 uniqueCode 有值(组件传 isOpen 时,新建场景 uniqueCode 为空,必须由 &&!!code 拦住避免 /detail?uniqueCode=undefined)。
    enabled: () => (enabled?.value ?? true) && !!uniqueCode.value,
    retry: false,
  })
}

/** 新增居委会公告 */
export function useCreateNoticeMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, INeighborhoodNoticeAddDTO>({
    mutationKey: ['createNeighborhoodNotice'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/neighborhood/notice', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodNoticeList'] })
    },
  })
}

/** 更新居委会公告 */
export function useUpdateNoticeMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, INeighborhoodNoticeUpdateDTO>({
    mutationKey: ['updateNeighborhoodNotice'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/neighborhood/notice', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodNoticeList'] })
      queryClient.invalidateQueries({ queryKey: ['neighborhoodNoticeDetail'] })
    },
  })
}

/** 删除居委会公告 */
export function useDeleteNoticeMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deleteNeighborhoodNotice'],
    mutationFn: async uniqueCode => await apiFetch<IResponse<boolean>>(`/neighborhood/notice/${uniqueCode}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodNoticeList'] })
    },
  })
}
