import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

// ==================== 类型 ====================

/** 文章类型:1=一图,2=三图 */
export type SpecialArticleType = 1 | 2
/** 内容类型:1=文本,2=链接 */
export type SpecialArticleContentType = 1 | 2
/** 是否原创:1=原创,2=否 */
export type SpecialArticleOriginal = 1 | 2
/** 是否图集:1=图集,2=否 */
export type SpecialArticleImageArticle = 1 | 2
/** 启用状态:1=启用,2=禁用 */
export type SpecialArticleEnableStatus = 1 | 2

/** 文章类型映射配置 */
export const specialArticleTypeConfig: Record<SpecialArticleType, { label: string, variant: 'default' | 'info' }> = {
  1: { label: '一图', variant: 'default' },
  2: { label: '三图', variant: 'info' },
}

/** 内容类型映射配置 */
export const specialArticleContentTypeConfig: Record<SpecialArticleContentType, { label: string, variant: 'default' | 'info' }> = {
  1: { label: '文本', variant: 'default' },
  2: { label: '链接', variant: 'info' },
}

/** 启用状态映射配置 */
export const specialArticleEnableStatusConfig: Record<SpecialArticleEnableStatus, { label: string, variant: 'default' | 'secondary' }> = {
  1: { label: '启用', variant: 'default' },
  2: { label: '禁用', variant: 'secondary' },
}

/** 列表查询参数(对接文档 3.8,额外支持 specialCode 过滤) */
export interface INeighborhoodSpecialArticleListQuery extends IPageParam {
  /** 按专题过滤(从路由 [specialCode] 取) */
  specialCode?: string
  /** 关键词(模糊搜索) */
  keyword?: string
}

/** 居委会专题文章 VO(对接文档 3.8,响应字段参照新增推理) */
export interface INeighborhoodSpecialArticle {
  /** 唯一标识 */
  uniqueCode: string
  /** 所属专题 code */
  specialCode: string
  /** 标题 */
  title: string
  /** 封面 */
  poster?: string
  /** 小图 */
  posterAppMin?: string
  /** 文章类型:1=一图,2=三图 */
  articleType?: SpecialArticleType
  /** 三图模式图片1 */
  articleImg1?: string
  /** 三图模式图片2 */
  articleImg2?: string
  /** 三图模式图片3 */
  articleImg3?: string
  /** 简介 */
  describes?: string
  /** 内容类型:1=文本,2=链接 */
  contentType?: SpecialArticleContentType
  /** 富文本(contentType=1 时) */
  content?: string
  /** 来源 */
  original?: string
  /** H5 地址(链接时) */
  sourceUrl?: string
  /** 关键词 */
  keywords?: string
  /** 作者 */
  authorName?: string
  /** 1=原创,2=否 */
  tOrFOriginal?: SpecialArticleOriginal
  /** 1=图集,2=否 */
  isImageArticle?: SpecialArticleImageArticle
  /** 图集图片数 */
  imgNum?: number
  /** 备注 */
  mark?: string
  /** 1=启用,2=禁用 */
  isEnable?: SpecialArticleEnableStatus
  /** 排序 */
  torder?: number
  /** 企业标识(后端注入) */
  orgCode?: string
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  updateTime?: string
}

/** 新增请求体(对接文档 3.8 OrgSpecialArticleAddReq) */
export interface INeighborhoodSpecialArticleAddDTO {
  /** 所属专题 code(从路由取) */
  specialCode: string
  /** 标题 */
  title: string
  /** 封面 */
  poster?: string
  /** 小图 */
  posterAppMin?: string
  /** 文章类型:1=一图,2=三图 */
  articleType?: SpecialArticleType
  /** 三图模式图片1 */
  articleImg1?: string
  /** 三图模式图片2 */
  articleImg2?: string
  /** 三图模式图片3 */
  articleImg3?: string
  /** 简介 */
  describes?: string
  /** 内容类型:1=文本,2=链接 */
  contentType?: SpecialArticleContentType
  /** 富文本(文本时) */
  content?: string
  /** 来源 */
  original?: string
  /** H5 地址(链接时) */
  sourceUrl?: string
  /** 关键词 */
  keywords?: string
  /** 作者 */
  authorName?: string
  /** 1=原创,2=否 */
  tOrFOriginal?: SpecialArticleOriginal
  /** 1=图集,2=否 */
  isImageArticle?: SpecialArticleImageArticle
  /** 图集图片数 */
  imgNum?: number
  /** 备注 */
  mark?: string
  /** 启用状态 */
  isEnable?: SpecialArticleEnableStatus
  /** 排序 */
  torder?: number
}

/** 更新请求体 = 新增 + uniqueCode */
export interface INeighborhoodSpecialArticleUpdateDTO extends INeighborhoodSpecialArticleAddDTO {
  /** 唯一标识 */
  uniqueCode: string
}

/** 分页列表响应 */
export type INeighborhoodSpecialArticleListResponse = IResponse<IPageResult<INeighborhoodSpecialArticle>>

/** 详情响应 */
export type INeighborhoodSpecialArticleDetailResponse = IResponse<INeighborhoodSpecialArticle>

// ==================== API 封装 ====================

/** 获取居委会专题文章分页列表(按 specialCode 过滤) */
export function useGetSpecialArticlePageQuery(query: Ref<INeighborhoodSpecialArticleListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<INeighborhoodSpecialArticleListResponse, Error>({
    queryKey: ['neighborhoodSpecialArticleList', query],
    queryFn: async () => await apiFetch<INeighborhoodSpecialArticleListResponse>('/neighborhood/specialArticle/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 获取居委会专题文章详情 */
export function useGetSpecialArticleDetailQuery(uniqueCode: Ref<string | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<INeighborhoodSpecialArticleDetailResponse, Error>({
    queryKey: ['neighborhoodSpecialArticleDetail', uniqueCode],
    queryFn: async () => await apiFetch<INeighborhoodSpecialArticleDetailResponse>('/neighborhood/specialArticle/detail', {
      method: 'get',
      query: { uniqueCode: uniqueCode.value },
    }),
    enabled: () => (enabled?.value ?? true) && !!uniqueCode.value,
    retry: false,
  })
}

/** 新增居委会专题文章 */
export function useCreateSpecialArticleMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, INeighborhoodSpecialArticleAddDTO>({
    mutationKey: ['createNeighborhoodSpecialArticle'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/neighborhood/specialArticle', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodSpecialArticleList'] })
    },
  })
}

/** 更新居委会专题文章 */
export function useUpdateSpecialArticleMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, INeighborhoodSpecialArticleUpdateDTO>({
    mutationKey: ['updateNeighborhoodSpecialArticle'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/neighborhood/specialArticle', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodSpecialArticleList'] })
      queryClient.invalidateQueries({ queryKey: ['neighborhoodSpecialArticleDetail'] })
    },
  })
}

/** 删除居委会专题文章 */
export function useDeleteSpecialArticleMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deleteNeighborhoodSpecialArticle'],
    mutationFn: async uniqueCode => await apiFetch<IResponse<boolean>>(`/neighborhood/specialArticle/${uniqueCode}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighborhoodSpecialArticleList'] })
    },
  })
}
