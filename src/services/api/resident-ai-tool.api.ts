import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'

// ==================== 公共类型 ====================

/** 通用启停(对接文档 14 节):1=启用,2=禁用 */
export type ResidentAiToolEnableStatus = 1 | 2

/** 启用状态映射配置 */
export const residentAiToolEnableStatusConfig: Record<ResidentAiToolEnableStatus, { label: string, variant: 'default' | 'secondary' }> = {
  1: { label: '启用', variant: 'default' },
  2: { label: '禁用', variant: 'secondary' },
}

// =====================================================================
// 6.1 居民AI工具分类 `/resident/ai-tool/cate`
// 约定:分类固定 City Data cate.type = 10(AI助手),后端注入。
// 无编辑接口,仅 list / page / 新增 / 更新 / 删除(更新用 PUT 整体)。
// =====================================================================

/** 分类 VO(对接文档 6.1 TblCommunityCateResp) */
export interface IResidentAiToolCate {
  /** 唯一标识 */
  uniqueCode: string
  /** 父级编码,默认 0 */
  parentCode?: string
  /** 分类名称 */
  name: string
  /** 描述 */
  describe?: string
  /** 排序 */
  torder?: number
  /** 分类类型(后端固定 10=AI助手) */
  type?: number
  /** 模板类型 */
  tempType?: number
  /** 启用状态:1=启用,2=禁用 */
  isEnable?: ResidentAiToolEnableStatus
  /** 合伙人标识 */
  partnerId?: string
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  operatorTime?: string
}

/** 分类新增请求体(对接文档 6.1) */
export interface IResidentAiToolCateAddDTO {
  /** 分类名称 */
  name: string
  /** 描述 */
  describe?: string
  /** 排序 */
  torder?: number
  /** 启用状态:1=启用,2=禁用 */
  isEnable?: ResidentAiToolEnableStatus
  /** 父级编码,默认 0 */
  parentCode?: string
}

/** 分类更新请求体 = 新增 + uniqueCode */
export interface IResidentAiToolCateUpdateDTO extends IResidentAiToolCateAddDTO {
  /** 唯一标识 */
  uniqueCode: string
}

/** 分类分页查询参数(对接文档 6.1,`/resident/ai-tool/cate/page?keyword=`) */
export interface IResidentAiToolCateListQuery extends IPageParam {
  /** 关键词 */
  keyword?: string
}

/** 分类分页响应 */
export type IResidentAiToolCateListResponse = IResponse<IPageResult<IResidentAiToolCate>>
/** 分类全部响应(下拉用) */
export type IResidentAiToolCateListAllResponse = IResponse<IResidentAiToolCate[]>

/** 获取居民AI工具分类分页列表(对接文档 6.1,`/resident/ai-tool/cate/page`) */
export function useGetResidentAiToolCatePageQuery(query: Ref<IResidentAiToolCateListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IResidentAiToolCateListResponse, Error>({
    queryKey: ['residentAiToolCateList', query],
    queryFn: async () => await apiFetch<IResidentAiToolCateListResponse>('/resident/ai-tool/cate/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 获取全部分类(下拉用,对接文档 6.1,`/resident/ai-tool/cate/list`) */
export function useGetResidentAiToolCateListQuery() {
  const { apiFetch } = useApiFetch()

  return useQuery<IResidentAiToolCateListAllResponse, Error>({
    queryKey: ['residentAiToolCateAll'],
    queryFn: async () => await apiFetch<IResidentAiToolCateListAllResponse>('/resident/ai-tool/cate/list'),
    retry: false,
  })
}

/** 新增分类(对接文档 6.1,`POST /resident/ai-tool/cate`) */
export function useCreateResidentAiToolCateMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IResidentAiToolCateAddDTO>({
    mutationKey: ['createResidentAiToolCate'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/resident/ai-tool/cate', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residentAiToolCateList'] })
      queryClient.invalidateQueries({ queryKey: ['residentAiToolCateAll'] })
    },
  })
}

/** 更新分类(对接文档 6.1,`PUT /resident/ai-tool/cate`) */
export function useUpdateResidentAiToolCateMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IResidentAiToolCateUpdateDTO>({
    mutationKey: ['updateResidentAiToolCate'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/resident/ai-tool/cate', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residentAiToolCateList'] })
      queryClient.invalidateQueries({ queryKey: ['residentAiToolCateAll'] })
    },
  })
}

/** 删除分类(对接文档 6.1,`DELETE /resident/ai-tool/cate/{uniqueCode}`) */
export function useDeleteResidentAiToolCateMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deleteResidentAiToolCate'],
    mutationFn: async uniqueCode => await apiFetch<IResponse<boolean>>(`/resident/ai-tool/cate/${uniqueCode}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residentAiToolCateList'] })
      queryClient.invalidateQueries({ queryKey: ['residentAiToolCateAll'] })
    },
  })
}

// =====================================================================
// 6.2 已开通 / 候选 / 分配 `/resident/ai-tool`
// 约定:
// - 已开通固定 service.type = 17,otherCode = SkillTool.thirdId(后端写入)
// - 候选工具:当前站长已分配 + ai_skill_tool.type = 2(Agent)
// - 开通只写社区服务,不写 ai_skill_user_assign
// 推荐流程:cate/list -> candidates -> assign -> page
// =====================================================================

/**
 * 候选工具技能类型(对接文档 14 节 / 技能工具 type):
 * 1=扣子 Coze,2=Agent(居民AI工具候选),3=AI AgentSkill
 */
export type SkillToolType = 1 | 2 | 3

/** 技能工具 type 映射配置 */
export const skillToolTypeConfig: Record<SkillToolType, { label: string, variant: 'default' | 'info' | 'secondary' }> = {
  1: { label: '扣子 Coze', variant: 'default' },
  2: { label: 'Agent', variant: 'info' },
  3: { label: 'AI AgentSkill', variant: 'secondary' },
}

/** 已开通 VO(对接文档 6.2 ResidentAiToolVO) */
export interface IResidentAiTool {
  /** 服务唯一标识 */
  uniqueCode: string
  /** 展示名称 */
  name?: string
  /** 海报图 */
  poster?: string
  /** 描述 */
  describe?: string
  /** 排序 */
  torder?: number
  /** 启用状态:1=启用,2=禁用 */
  isEnable?: ResidentAiToolEnableStatus
  /** 分类编码 */
  cateCode?: string
  /** 分类名称 */
  cateName?: string
  /** 外部标识(= thirdId) */
  otherCode?: string
  /** 技能ID(反查) */
  skillId?: number
  /** 技能名称(反查) */
  skillName?: string
  /** 技能图标(反查) */
  skillIcon?: string
  /** 创建时间 */
  createTime?: string
}

/** 候选工具 VO(对接文档 6.2 MySkillVO) */
export interface IMySkill {
  /** 技能ID */
  skillId: number
  /** 工具名称 */
  name: string
  /** 图标 */
  icon?: string
  /** 第三方ID(开通时映射为 otherCode) */
  thirdId?: string
  /** 类型:1=扣子,2=Agent,3=AI AgentSkill */
  type?: SkillToolType
  /** 描述 */
  description?: string
  /** 输入类型 */
  inputType?: number
  /** 能力标签 */
  tags?: string[]
  /** 工具模式:1=单次对话,2=流程式向导 */
  toolMode?: number
}

/** 已开通分页查询参数(对接文档 6.2) */
export interface IResidentAiToolListQuery extends IPageParam {
  /** 分类编码 */
  cateCode?: string
  /** 关键词 */
  keyword?: string
}

/** 候选工具分页查询参数(对接文档 6.2) */
export interface IResidentAiToolCandidateQuery extends IPageParam {
  /** 工具名模糊 */
  name?: string
}

/** 开通分配请求体(对接文档 6.2) */
export interface IResidentAiToolAssignDTO {
  /** 分类 uniqueCode */
  cateCode: string
  /** 候选工具 skillId */
  skillId: number
  /** 展示名称(不传则用工具信息) */
  name?: string
  /** 海报图(不传则用工具信息) */
  poster?: string
  /** 描述(不传则用工具信息) */
  describe?: string
  /** 排序 */
  torder?: number
  /** 启用状态:1=启用,2=禁用 */
  isEnable?: ResidentAiToolEnableStatus
}

/** 更新请求体(对接文档 6.2) */
export interface IResidentAiToolUpdateDTO {
  /** 唯一标识 */
  uniqueCode: string
  /** 分类编码 */
  cateCode?: string
  /** 分类名称 */
  cateName?: string
  /** 展示名称 */
  name?: string
  /** 海报图 */
  poster?: string
  /** 描述 */
  describe?: string
  /** 排序 */
  torder?: number
  /** 启用状态:1=启用,2=禁用 */
  isEnable?: ResidentAiToolEnableStatus
}

/** 已开通分页响应 */
export type IResidentAiToolListResponse = IResponse<IPageResult<IResidentAiTool>>
/** 候选工具分页响应 */
export type IResidentAiToolCandidateResponse = IResponse<IPageResult<IMySkill>>

/** 获取已开通工具分页列表(对接文档 6.2,`/resident/ai-tool/page`) */
export function useGetResidentAiToolPageQuery(query: Ref<IResidentAiToolListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IResidentAiToolListResponse, Error>({
    queryKey: ['residentAiToolList', query],
    queryFn: async () => await apiFetch<IResidentAiToolListResponse>('/resident/ai-tool/page', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 获取候选工具分页列表(对接文档 6.2,`/resident/ai-tool/candidates`) */
export function useGetResidentAiToolCandidatesQuery(query: Ref<IResidentAiToolCandidateQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IResidentAiToolCandidateResponse, Error>({
    queryKey: ['residentAiToolCandidates', query],
    queryFn: async () => await apiFetch<IResidentAiToolCandidateResponse>('/resident/ai-tool/candidates', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 开通分配(对接文档 6.2,`POST /resident/ai-tool/assign`) */
export function useAssignResidentAiToolMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IResidentAiToolAssignDTO>({
    mutationKey: ['assignResidentAiTool'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/resident/ai-tool/assign', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residentAiToolList'] })
    },
  })
}

/** 更新已开通工具(对接文档 6.2,`PUT /resident/ai-tool`) */
export function useUpdateResidentAiToolMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, IResidentAiToolUpdateDTO>({
    mutationKey: ['updateResidentAiTool'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/resident/ai-tool', {
      method: 'put',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residentAiToolList'] })
    },
  })
}

/** 取消开通(对接文档 6.2,`DELETE /resident/ai-tool/{uniqueCode}`) */
export function useDeleteResidentAiToolMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, string>({
    mutationKey: ['deleteResidentAiTool'],
    mutationFn: async uniqueCode => await apiFetch<IResponse<boolean>>(`/resident/ai-tool/${uniqueCode}`, {
      method: 'delete',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residentAiToolList'] })
    },
  })
}
