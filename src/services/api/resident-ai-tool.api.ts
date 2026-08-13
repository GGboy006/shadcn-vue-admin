import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useApiFetch } from '@/composables/use-fetch'

import type { IPageParam, IPageResult, IResponse } from '../types/response.type'
import type { SkillAssignStatus, SkillInputType, SkillToolMode } from './skill.api'

// ==================== 公共类型 ====================

/** 通用启停(对接文档 §6):1=启用,2=禁用 */
export type ResidentAiToolEnableStatus = 1 | 2

/** 启用状态映射配置 */
export const residentAiToolEnableStatusConfig: Record<ResidentAiToolEnableStatus, { label: string, variant: 'default' | 'secondary' }> = {
  1: { label: '启用', variant: 'default' },
  2: { label: '禁用', variant: 'secondary' },
}

// =====================================================================
// 3. 分类 `/resident/ai-tool/cate`
// 约定:分类固定 City Data cate.type = 10(AI助手),后端注入。
// 无编辑接口,仅 list / page / 新增 / 更新 / 删除(更新用 PUT 整体)。
// =====================================================================

/** 分类 VO(对接文档 §3.6 TblCommunityCateResp) */
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

/** 分类新增请求体(对接文档 §3) */
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

/** 分类分页查询参数(对接文档 §3,`/resident/ai-tool/cate/page?keyword=`) */
export interface IResidentAiToolCateListQuery extends IPageParam {
  /** 关键词 */
  keyword?: string
}

/** 分类分页响应 */
export type IResidentAiToolCateListResponse = IResponse<IPageResult<IResidentAiToolCate>>
/** 分类全部响应(下拉用) */
export type IResidentAiToolCateListAllResponse = IResponse<IResidentAiToolCate[]>

/** 获取居民AI工具分类分页列表(对接文档 §3,`/resident/ai-tool/cate/page`) */
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

/** 获取全部分类(下拉用,对接文档 §3,`/resident/ai-tool/cate/list`) */
export function useGetResidentAiToolCateListQuery() {
  const { apiFetch } = useApiFetch()

  return useQuery<IResidentAiToolCateListAllResponse, Error>({
    queryKey: ['residentAiToolCateAll'],
    queryFn: async () => await apiFetch<IResidentAiToolCateListAllResponse>('/resident/ai-tool/cate/list'),
    retry: false,
  })
}

/** 新增分类(对接文档 §3,`POST /resident/ai-tool/cate`) */
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

/** 更新分类(对接文档 §3,`PUT /resident/ai-tool/cate`) */
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

/** 删除分类(对接文档 §3,`DELETE /resident/ai-tool/cate/{uniqueCode}`) */
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
// 4. 工具分配 `/resident/ai-tool`
// 约定(对接文档 §1):
// - 分配关系写本地 `ai_skill_user_assign`:userId=站长,type=7,cate_code=分类 uniqueCode
// - 候选池 = 平台已分给站长的技能(type=1)且 `ai_skill_tool.type=2`(Agent)
// - 分配成功后后端同步城市 batchSaveAiService,写 `service.type=17`,otherCode=SkillTool.thirdId
// - 粒度是「分类」不是「单个居民」:全小区居民共享同一份工具列表,故接口无 residentId
// - list / assign-list 均不分页;无单条更新/删除接口,增删一律走 assign 全量覆盖
// 推荐流程:cate/list -> assign-list -> assign -> list
// =====================================================================

/** 已分配 VO(对接文档 §4.4 ResidentAiToolVO) */
export interface IResidentAiTool {
  /** 城市服务唯一标识(本地列表可能为空) */
  uniqueCode?: string
  /** 展示名称 */
  name?: string
  /** 封面 */
  poster?: string
  /** 描述 */
  describe?: string
  /** 排序 */
  torder?: number
  /** 启用状态:1=启用,2=禁用 */
  isEnable?: ResidentAiToolEnableStatus
  /** 分类标识 */
  cateCode?: string
  /** 分类名称 */
  cateName?: string
  /** 外部标识(= SkillTool.thirdId) */
  otherCode?: string
  /** 技能ID(雪花 Long,按字符串处理) */
  skillId?: string
  /** 技能名称 */
  skillName?: string
  /** 技能图标 */
  skillIcon?: string
  /** 分配创建时间 */
  createTime?: string
}

/**
 * 候选工具 VO(对接文档 §4.2 AssignSkillVO)
 *
 * 枚举复用 `skill.api.ts`:`skillInputTypeConfig` / `skillAssignStatusConfig`。
 */
export interface IResidentAiToolAssignSkill {
  /** 技能ID(雪花 Long,按字符串处理) */
  skillId: string
  /** 名称 */
  name: string
  /** 图标 */
  icon?: string
  /** 描述 */
  description?: string
  /** 输入类型:1=文本,2=图片,3=音频,4=混合 */
  inputType?: SkillInputType
  /** 能力标签 */
  tags?: string[]
  /** 站长侧分配状态:1=生效,2=暂停,3=过期 */
  assignStatus?: SkillAssignStatus
  /** 工具模式:1=单次对话,2=流程式向导 */
  toolMode?: SkillToolMode
  /** 当前 cateCode 下是否已对居民开放 */
  checked: boolean
}

/** 已分配列表查询参数(对接文档 §4.1,不分页) */
export interface IResidentAiToolListQuery {
  /** 按分类过滤 */
  cateCode?: string
  /** 工具名称模糊 */
  keyword?: string
}

/** 候选列表查询参数(对接文档 §4.2,不分页) */
export interface IResidentAiToolAssignListQuery {
  /** 分类 uniqueCode(必填) */
  cateCode: string
  /** 工具名称模糊 */
  name?: string
}

/**
 * 批量分配请求体(对接文档 §4.3)
 *
 * 按**单个分类全量覆盖**:后端 diff 出新增(target−current)与删除(current−target),
 * 仅影响当前 cateCode。传 `skillIds: []` 表示清空该分类。
 */
export interface IResidentAiToolAssignDTO {
  /** 分类 uniqueCode */
  cateCode: string
  /** 该分类最终要保留的技能ID列表(雪花 Long,按字符串处理);`[]` = 清空 */
  skillIds: string[]
}

/** 已分配列表响应(不分页) */
export type IResidentAiToolListResponse = IResponse<IResidentAiTool[]>
/** 候选列表响应(不分页) */
export type IResidentAiToolAssignListResponse = IResponse<IResidentAiToolAssignSkill[]>

/** 获取已分配工具列表(对接文档 §4.1,`GET /resident/ai-tool/list`,不分页) */
export function useGetResidentAiToolListQuery(query: Ref<IResidentAiToolListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IResidentAiToolListResponse, Error>({
    queryKey: ['residentAiToolList', query],
    queryFn: async () => await apiFetch<IResidentAiToolListResponse>('/resident/ai-tool/list', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/**
 * 获取候选工具列表(对接文档 §4.2,`GET /resident/ai-tool/assign-list`,不分页)
 *
 * `cateCode` 必填,缺失时不发请求。返回项的 `checked` 表示该分类下是否已开放。
 */
export function useGetResidentAiToolAssignListQuery(query: Ref<IResidentAiToolAssignListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IResidentAiToolAssignListResponse, Error>({
    queryKey: ['residentAiToolAssignList', query],
    queryFn: async () => await apiFetch<IResidentAiToolAssignListResponse>('/resident/ai-tool/assign-list', {
      method: 'get',
      query: query.value,
    }),
    enabled: computed(() => !!query.value.cateCode),
    retry: false,
  })
}

/**
 * 批量分配(对接文档 §4.3,`POST /resident/ai-tool/assign`)
 *
 * 按单个分类全量覆盖,提交该分类最终要保留的 `skillIds`;传 `[]` 清空该分类。
 */
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
      queryClient.invalidateQueries({ queryKey: ['residentAiToolAssignList'] })
    },
  })
}
