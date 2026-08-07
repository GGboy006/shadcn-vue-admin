import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

// ==================== 公共类型 ====================

/**
 * 知识分类类型(对接文档 3.1 / 枚举速查):1=安法治,2=科普
 */
export type KnowledgeCategoryType = 1 | 2
/** 通用启停(对接文档 14 节):1=启用,2=禁用 */
export type KnowledgeEnableStatus = 1 | 2

/** 知识分类类型映射配置 */
export const knowledgeCategoryTypeConfig: Record<KnowledgeCategoryType, { label: string, variant: 'default' | 'info' }> = {
  1: { label: '安法治', variant: 'default' },
  2: { label: '科普', variant: 'info' },
}

/** 启用状态映射配置 */
export const knowledgeEnableStatusConfig: Record<KnowledgeEnableStatus, { label: string, variant: 'default' | 'secondary' }> = {
  1: { label: '启用', variant: 'default' },
  2: { label: '禁用', variant: 'secondary' },
}

// =====================================================================
// 3.1 知识分类 `/knowledge/category`
// =====================================================================

/** 知识分类 VO(对接文档 3.1 KnowledgeCategoryVO) */
export interface IKnowledgeCategory {
  /** 分类ID */
  categoryId: number
  /** 分类名称 */
  categoryName: string
  /** 分类类型:1=安法治,2=科普 */
  categoryType: KnowledgeCategoryType
  /** 图标 */
  icon?: string
  /** 描述 */
  description?: string
  /** 排序 */
  sortOrder?: number
  /** 启用状态:1=启用,2=禁用 */
  status?: KnowledgeEnableStatus
  /** 站长ID */
  stationId?: number
  /** 是否可编辑(本站可改删,全站通用不可改) */
  editable?: boolean
  /** 文章数 */
  articleCount?: number
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  updateTime?: string
}

/** 分类分页查询参数(对接文档 3.1) */
export interface IKnowledgeCategoryListQuery extends IPageParam {
  /** 分类名称 */
  categoryName?: string
  /** 分类类型:1=安法治,2=科普 */
  categoryType?: KnowledgeCategoryType
  /** 状态:1=启用,2=禁用 */
  status?: KnowledgeEnableStatus
}

/** 分类新增/更新请求体(对接文档 3.1) */
export interface IKnowledgeCategorySaveDTO {
  /** 分类ID(更新必填) */
  categoryId?: number
  /** 分类名称 */
  categoryName: string
  /** 分类类型:1=安法治,2=科普 */
  categoryType: KnowledgeCategoryType
  /** 图标 */
  icon?: string
  /** 描述 */
  description?: string
  /** 排序 */
  sortOrder?: number
  /** 状态:1=启用,2=禁用,默认启用 */
  status?: KnowledgeEnableStatus
}

/** 分类分页响应 */
export type IKnowledgeCategoryListResponse = IResponse<IPageResult<IKnowledgeCategory>>
/** 分类启用列表响应(下拉用) */
export type IKnowledgeCategoryListAllResponse = IResponse<IKnowledgeCategory[]>
/** 分类详情响应 */
export type IKnowledgeCategoryDetailResponse = IResponse<IKnowledgeCategory>

/** 获取知识分类分页列表(对接文档 3.1,`/knowledge/category/page`) */
export function useGetKnowledgeCategoryPageQuery(query: Ref<IKnowledgeCategoryListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IKnowledgeCategoryListResponse, Error>({
    queryKey: ['knowledgeCategoryList', query],
    queryFn: async () => await apiFetch<IKnowledgeCategoryListResponse>('/knowledge/category/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 获取启用分类列表(下拉用,对接文档 3.1,`/knowledge/category/list`) */
export function useGetKnowledgeCategoryListQuery() {
  const { apiFetch } = useApiFetch()

  return useQuery<IKnowledgeCategoryListAllResponse, Error>({
    queryKey: ['knowledgeCategoryAll'],
    queryFn: async () => await apiFetch<IKnowledgeCategoryListAllResponse>('/knowledge/category/list'),
    retry: false,
  })
}

/** 获取知识分类详情(对接文档 3.1,`/knowledge/category/{categoryId}`) */
export function useGetKnowledgeCategoryDetailQuery(categoryId: Ref<number | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IKnowledgeCategoryDetailResponse, Error>({
    queryKey: ['knowledgeCategoryDetail', categoryId],
    queryFn: async () => await apiFetch<IKnowledgeCategoryDetailResponse>(`/knowledge/category/${categoryId.value}`),
    enabled: () => (enabled?.value ?? true) && categoryId.value !== undefined,
    retry: false,
  })
}

/** 新增知识分类(对接文档 3.1,`POST /knowledge/category`) */
export function useCreateKnowledgeCategoryMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IKnowledgeCategorySaveDTO>({
    mutationKey: ['createKnowledgeCategory'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/knowledge/category', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeCategoryList'] })
      queryClient.invalidateQueries({ queryKey: ['knowledgeCategoryAll'] })
    },
  })
}

/** 更新知识分类(对接文档 3.1,`PUT /knowledge/category`) */
export function useUpdateKnowledgeCategoryMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IKnowledgeCategorySaveDTO>({
    mutationKey: ['updateKnowledgeCategory'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/knowledge/category', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeCategoryList'] })
      queryClient.invalidateQueries({ queryKey: ['knowledgeCategoryAll'] })
      queryClient.invalidateQueries({ queryKey: ['knowledgeCategoryDetail'] })
    },
  })
}

/** 启停知识分类(对接文档 3.1,`PUT /knowledge/category/{categoryId}/status?status=`) */
export function useUpdateKnowledgeCategoryStatusMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, { categoryId: number, status: KnowledgeEnableStatus }>({
    mutationKey: ['updateKnowledgeCategoryStatus'],
    mutationFn: async ({ categoryId, status }) => await apiFetch<IResponse<boolean>>(`/knowledge/category/${categoryId}/status`, {
      method: 'put',
      query: { status },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeCategoryList'] })
      queryClient.invalidateQueries({ queryKey: ['knowledgeCategoryAll'] })
    },
  })
}

/** 删除知识分类(对接文档 3.1,`DELETE /knowledge/category/{categoryId}`) */
export function useDeleteKnowledgeCategoryMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, number>({
    mutationKey: ['deleteKnowledgeCategory'],
    mutationFn: async categoryId => await apiFetch<IResponse<boolean>>(`/knowledge/category/${categoryId}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeCategoryList'] })
      queryClient.invalidateQueries({ queryKey: ['knowledgeCategoryAll'] })
    },
  })
}

// =====================================================================
// 3.2 知识文章 `/knowledge/article`
// =====================================================================

/** 发布状态(对接文档 3.2 / 枚举速查):0=草稿,1=已发布,2=已下架 */
export type KnowledgePublishStatus = 0 | 1 | 2
/** 置顶:1=置顶,0=否 */
export type KnowledgeTopFlag = 0 | 1

/** 发布状态映射配置 */
export const knowledgePublishStatusConfig: Record<KnowledgePublishStatus, { label: string, variant: 'secondary' | 'success' | 'destructive' }> = {
  0: { label: '草稿', variant: 'secondary' },
  1: { label: '已发布', variant: 'success' },
  2: { label: '已下架', variant: 'destructive' },
}

/** 知识文章 VO(对接文档 3.2 KnowledgeArticleVO) */
export interface IKnowledgeArticle {
  /** 文章ID */
  articleId: number
  /** 分类ID */
  categoryId: number
  /** 分类名称 */
  categoryName?: string
  /** 标题 */
  title: string
  /** 摘要 */
  summary?: string
  /** 正文 */
  content?: string
  /** 封面图 */
  coverImage?: string
  /** 附件 */
  attachments?: string[]
  /** 标签 */
  tags?: string[]
  /** 来源 */
  source?: string
  /** 作者 */
  author?: string
  /** 浏览数 */
  viewCount?: number
  /** 点赞数 */
  likeCount?: number
  /** 置顶:1=置顶,0=否 */
  topFlag?: KnowledgeTopFlag
  /** 发布状态:0=草稿,1=已发布,2=已下架 */
  publishStatus?: KnowledgePublishStatus
  /** 发布时间 */
  publishTime?: string
  /** 站长ID */
  stationId?: number
  /** 是否可编辑(本站可改删) */
  editable?: boolean
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  updateTime?: string
}

/** 文章分页查询参数(对接文档 3.2) */
export interface IKnowledgeArticleListQuery extends IPageParam {
  /** 分类ID */
  categoryId?: number
  /** 关键词 */
  keyword?: string
  /** 发布状态:0=草稿,1=已发布,2=已下架 */
  publishStatus?: KnowledgePublishStatus
  /** 置顶:1=置顶,0=否 */
  topFlag?: KnowledgeTopFlag
}

/** 文章新增/更新请求体(对接文档 3.2) */
export interface IKnowledgeArticleSaveDTO {
  /** 文章ID(更新必填) */
  articleId?: number
  /** 分类ID */
  categoryId: number
  /** 标题 */
  title: string
  /** 正文 */
  content: string
  /** 摘要 */
  summary?: string
  /** 封面图 */
  coverImage?: string
  /** 来源 */
  source?: string
  /** 作者 */
  author?: string
  /** 附件 */
  attachments?: string[]
  /** 标签 */
  tags?: string[]
  /** 置顶:1/0 */
  topFlag?: KnowledgeTopFlag
  /** 发布状态:0/1/2 */
  publishStatus?: KnowledgePublishStatus
}

/** 文章分页响应 */
export type IKnowledgeArticleListResponse = IResponse<IPageResult<IKnowledgeArticle>>
/** 文章详情响应 */
export type IKnowledgeArticleDetailResponse = IResponse<IKnowledgeArticle>

/** 获取知识文章分页列表(对接文档 3.2,`/knowledge/article/page`) */
export function useGetKnowledgeArticlePageQuery(query: Ref<IKnowledgeArticleListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IKnowledgeArticleListResponse, Error>({
    queryKey: ['knowledgeArticleList', query],
    queryFn: async () => await apiFetch<IKnowledgeArticleListResponse>('/knowledge/article/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 获取知识文章详情(对接文档 3.2,`/knowledge/article/{articleId}`) */
export function useGetKnowledgeArticleDetailQuery(articleId: Ref<number | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IKnowledgeArticleDetailResponse, Error>({
    queryKey: ['knowledgeArticleDetail', articleId],
    queryFn: async () => await apiFetch<IKnowledgeArticleDetailResponse>(`/knowledge/article/${articleId.value}`),
    enabled: () => (enabled?.value ?? true) && articleId.value !== undefined,
    retry: false,
  })
}

/** 新增知识文章(对接文档 3.2,`POST /knowledge/article`) */
export function useCreateKnowledgeArticleMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IKnowledgeArticleSaveDTO>({
    mutationKey: ['createKnowledgeArticle'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/knowledge/article', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeArticleList'] })
    },
  })
}

/** 更新知识文章(对接文档 3.2,`PUT /knowledge/article`) */
export function useUpdateKnowledgeArticleMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IKnowledgeArticleSaveDTO>({
    mutationKey: ['updateKnowledgeArticle'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/knowledge/article', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeArticleList'] })
      queryClient.invalidateQueries({ queryKey: ['knowledgeArticleDetail'] })
    },
  })
}

/** 更新文章发布状态(对接文档 3.2,`PUT /knowledge/article/{articleId}/publish-status?publishStatus=`) */
export function useUpdateKnowledgeArticlePublishStatusMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, { articleId: number, publishStatus: KnowledgePublishStatus }>({
    mutationKey: ['updateKnowledgeArticlePublishStatus'],
    mutationFn: async ({ articleId, publishStatus }) => await apiFetch<IResponse<boolean>>(`/knowledge/article/${articleId}/publish-status`, {
      method: 'put',
      query: { publishStatus },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeArticleList'] })
      queryClient.invalidateQueries({ queryKey: ['knowledgeArticleDetail'] })
    },
  })
}

/** 文章置顶/取消置顶(对接文档 3.2,`PUT /knowledge/article/{articleId}/top?topFlag=`) */
export function useUpdateKnowledgeArticleTopMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, { articleId: number, topFlag: KnowledgeTopFlag }>({
    mutationKey: ['updateKnowledgeArticleTop'],
    mutationFn: async ({ articleId, topFlag }) => await apiFetch<IResponse<boolean>>(`/knowledge/article/${articleId}/top`, {
      method: 'put',
      query: { topFlag },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeArticleList'] })
      queryClient.invalidateQueries({ queryKey: ['knowledgeArticleDetail'] })
    },
  })
}

/** 删除知识文章(对接文档 3.2,`DELETE /knowledge/article/{articleId}`) */
export function useDeleteKnowledgeArticleMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, number>({
    mutationKey: ['deleteKnowledgeArticle'],
    mutationFn: async articleId => await apiFetch<IResponse<boolean>>(`/knowledge/article/${articleId}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeArticleList'] })
    },
  })
}

// =====================================================================
// 3.3 快捷问答 `/knowledge/question`
// =====================================================================

/** 快捷问答 VO(对接文档 3.3 KnowledgeQuickQuestionVO) */
export interface IKnowledgeQuestion {
  /** 问答ID */
  questionId: number
  /** 问答名称 */
  questionName: string
  /** 关键词 */
  keyword: string
  /** 提示词 */
  prompt: string
  /** 图标 */
  icon?: string
  /** 排序 */
  sortOrder?: number
  /** 启用状态:1=启用,2=禁用 */
  status?: KnowledgeEnableStatus
  /** 站长ID */
  stationId?: number
  /** 是否可编辑(本站可改删) */
  editable?: boolean
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  updateTime?: string
}

/** 问答新增/更新请求体(对接文档 3.3) */
export interface IKnowledgeQuestionSaveDTO {
  /** 问答ID(更新必填) */
  questionId?: number
  /** 问答名称 */
  questionName: string
  /** 关键词 */
  keyword: string
  /** 提示词 */
  prompt: string
  /** 图标 */
  icon?: string
  /** 排序 */
  sortOrder?: number
  /** 启用状态:1=启用,2=禁用 */
  status?: KnowledgeEnableStatus
}

/** 问答分页查询参数(对接文档 3.3) */
export interface IKnowledgeQuestionListQuery extends IPageParam {
  /** 关键词 */
  keyword?: string
}

/** 问答分页响应 */
export type IKnowledgeQuestionListResponse = IResponse<IPageResult<IKnowledgeQuestion>>
/** 问答启用列表响应(下拉用) */
export type IKnowledgeQuestionListAllResponse = IResponse<IKnowledgeQuestion[]>
/** 问答详情响应 */
export type IKnowledgeQuestionDetailResponse = IResponse<IKnowledgeQuestion>

/** 获取快捷问答分页列表(对接文档 3.3,`/knowledge/question/page`) */
export function useGetKnowledgeQuestionPageQuery(query: Ref<IKnowledgeQuestionListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IKnowledgeQuestionListResponse, Error>({
    queryKey: ['knowledgeQuestionList', query],
    queryFn: async () => await apiFetch<IKnowledgeQuestionListResponse>('/knowledge/question/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 获取启用问答列表(下拉用,对接文档 3.3,`/knowledge/question/list`) */
export function useGetKnowledgeQuestionListQuery() {
  const { apiFetch } = useApiFetch()

  return useQuery<IKnowledgeQuestionListAllResponse, Error>({
    queryKey: ['knowledgeQuestionAll'],
    queryFn: async () => await apiFetch<IKnowledgeQuestionListAllResponse>('/knowledge/question/list'),
    retry: false,
  })
}

/** 获取快捷问答详情(对接文档 3.3,`/knowledge/question/{questionId}`) */
export function useGetKnowledgeQuestionDetailQuery(questionId: Ref<number | undefined>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IKnowledgeQuestionDetailResponse, Error>({
    queryKey: ['knowledgeQuestionDetail', questionId],
    queryFn: async () => await apiFetch<IKnowledgeQuestionDetailResponse>(`/knowledge/question/${questionId.value}`),
    enabled: () => (enabled?.value ?? true) && questionId.value !== undefined,
    retry: false,
  })
}

/** 新增快捷问答(对接文档 3.3,`POST /knowledge/question`) */
export function useCreateKnowledgeQuestionMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IKnowledgeQuestionSaveDTO>({
    mutationKey: ['createKnowledgeQuestion'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/knowledge/question', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeQuestionList'] })
      queryClient.invalidateQueries({ queryKey: ['knowledgeQuestionAll'] })
    },
  })
}

/** 更新快捷问答(对接文档 3.3,`PUT /knowledge/question`) */
export function useUpdateKnowledgeQuestionMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IKnowledgeQuestionSaveDTO>({
    mutationKey: ['updateKnowledgeQuestion'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/knowledge/question', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeQuestionList'] })
      queryClient.invalidateQueries({ queryKey: ['knowledgeQuestionAll'] })
      queryClient.invalidateQueries({ queryKey: ['knowledgeQuestionDetail'] })
    },
  })
}

/** 启停快捷问答(对接文档 3.3,`PUT /knowledge/question/{questionId}/status?status=`) */
export function useUpdateKnowledgeQuestionStatusMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, { questionId: number, status: KnowledgeEnableStatus }>({
    mutationKey: ['updateKnowledgeQuestionStatus'],
    mutationFn: async ({ questionId, status }) => await apiFetch<IResponse<boolean>>(`/knowledge/question/${questionId}/status`, {
      method: 'put',
      query: { status },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeQuestionList'] })
      queryClient.invalidateQueries({ queryKey: ['knowledgeQuestionAll'] })
    },
  })
}

/** 删除快捷问答(对接文档 3.3,`DELETE /knowledge/question/{questionId}`) */
export function useDeleteKnowledgeQuestionMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, number>({
    mutationKey: ['deleteKnowledgeQuestion'],
    mutationFn: async questionId => await apiFetch<IResponse<boolean>>(`/knowledge/question/${questionId}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeQuestionList'] })
      queryClient.invalidateQueries({ queryKey: ['knowledgeQuestionAll'] })
    },
  })
}
