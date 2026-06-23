import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import type { IAIImageGeneration, IFlowCompletionVO, IQuicklyCreateRequest, ISkillDetail, ISkillFlowDataVO, IWizardSubmitForm } from '@/pages/apps/types/wizard.types'

import { useApiFetch } from '@/composables/use-fetch'

import type { IResponse } from '../types/response.type'

/** 输入类型：1=文本，2=图片，3=音频，4=混合 */
export type SkillInputType = 1 | 2 | 3 | 4

/** 工具模式：1=单次对话，2=流程式向导 */
export type SkillToolMode = 1 | 2

/** 分配状态：1=生效中，2=暂停，3=过期 */
export type SkillAssignStatus = 1 | 2 | 3

/** 输入类型映射配置 */
export const skillInputTypeConfig: Record<SkillInputType, { label: string, icon: string }> = {
  1: { label: '文本生成', icon: 'FileText' },
  2: { label: '图像生成', icon: 'Image' },
  3: { label: '语音合成', icon: 'Mic' },
  4: { label: '混合', icon: 'Layers' },
}

// 兼容旧代码的别名导出
/** @deprecated 使用 skillInputTypeConfig */
export const inputTypeConfig = skillInputTypeConfig
/** @deprecated 使用 skillInputTypeConfig */
export const inputTypeFilterOptions = [
  { label: '全部', value: 'all' },
  { label: '文本生成', value: '1' },
  { label: '图像生成', value: '2' },
  // { label: '语音合成', value: '3' },
  // { label: '混合', value: '4' },
] as const

/** 分配状态映射配置 */
export const skillAssignStatusConfig: Record<SkillAssignStatus, { label: string, variant: 'default' | 'secondary' | 'destructive' }> = {
  1: { label: '已分配', variant: 'default' },
  2: { label: '暂停', variant: 'secondary' },
  3: { label: '过期', variant: 'destructive' },
}

/** 技能 VO */
export interface ISkill {
  /** 技能ID */
  skillId: number
  /** 技能名称 */
  name: string
  /** 技能图标URL */
  icon: string
  /** 技能描述 */
  description: string
  /** 输入类型：1=文本，2=图片，3=音频，4=混合 */
  inputType: SkillInputType
  /** 能力标签 */
  tags: string[]
  /** 工具模式：1=单次对话，2=流程式向导 */
  toolMode: SkillToolMode
  /** 类型：1=扣子(Coze)，2=Agent，3=AI AgentSkill */
  type: number
  /** 第三方平台ID：type 1/2 时用于调用详情接口 */
  thirdId: string
}

/** 分配技能 VO */
export interface IAssignSkill extends ISkill {
  /** 分配状态：1=生效中，2=暂停，3=过期 */
  assignStatus: SkillAssignStatus
  /** 是否已选中 */
  checked: boolean
}

/** 商户列表 VO（站长查询已分配技能的商户） */
export interface ISkillMerchantVO {
  /** 商户ID */
  merchantId: number
  /** 昵称 */
  nickname: string
  /** 手机号 */
  phone: string
  /** 商户编号 */
  merchantCode: string
  /** 商户/物业/居委会名称 */
  merchantName: string
  /** Logo */
  logo: string
  /** 所属小区站长用户ID */
  stationUserId: number
  /** 类型：4=商户，5=物业，6=居委会 */
  type: number
  /** 联系人 */
  contactName: string
  /** 联系电话 */
  contactPhone: string
  /** 签约日期 */
  signDate: string
  /** 签约费用 */
  signFee: number
  /** 营业状态：1=营业中，2=休息中，3=已打烊，4=暂停营业 */
  businessStatus: number
  /** 营业时间 */
  businessHours: string
  /** 状态：1=启用，2=禁用 */
  status: number
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

/** 技能列表查询参数（兼容旧代码） */
export interface ISkillListQuery {
  /** 技能名称（模糊搜索） */
  name?: string
  /** 技能类型 */
  type?: string
  /** 输入类型：1=文本，2=图片，3=音频，4=混合 */
  inputType?: string
  /** 页码 */
  pageNum: number
  /** 每页数量 */
  pageSize: number
  /** 是否查询总条数 */
  searchCount?: string
  /** 排序字段集合 */
  sortItemList?: string
}

/** 商户技能列表查询参数 */
export interface IMerchantSkillListQuery {
  /** 商户/物业ID */
  merchantId: string
  /** 技能名称（模糊） */
  name?: string
  /** 输入类型：1=文本，2=图片，3=音频，4=混合 */
  inputType?: string
  /** 页码 */
  pageNum: number
  /** 每页数量 */
  pageSize: number
  /** 是否查询总条数 */
  searchCount?: string
  /** 排序字段集合 */
  sortItemList?: string
}

/** 分配技能给商户 DTO */
export interface ISkillAssignMerchantDTO {
  /** 被分配商户ID */
  merchantId: string
  /** 技能ID集合 */
  skillIds: number[]
}

/** 技能列表响应 */
export type ISkillListResponse = IResponse<IPageResult<ISkill>>

/** 商户技能列表响应 */
export type IMerchantSkillListResponse = IResponse<IPageResult<IAssignSkill>>

// ==================== API 封装 ====================

/** 获取技能分页列表 */
export function useGetSkillListQuery(query: Ref<ISkillListQuery | IMerchantSkillListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ISkillListResponse, Error>({
    queryKey: ['skillList', query],
    queryFn: async () => await apiFetch<ISkillListResponse>('/skill/list', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 获取商户/物业的技能列表（含分配状态） */
export function useGetMerchantSkillListQuery(query: Ref<IMerchantSkillListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IMerchantSkillListResponse, Error>({
    queryKey: ['merchantSkillList', query],
    queryFn: async () => await apiFetch<IMerchantSkillListResponse>('/skill/merchant-list', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 分配技能给商户 */
export function useAssignSkillToMerchantMutation() {
  const { apiFetch } = useApiFetch()
  const queryClient = useQueryClient()

  return useMutation<IResponse<boolean>, Error, ISkillAssignMerchantDTO>({
    mutationKey: ['assignSkillToMerchant'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/skill/assign-merchant', {
      method: 'post',
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantSkillList'] })
    },
  })
}

// ==================== 向导页面 API ====================

/** 技能详情响应 */
export type ISkillDetailResponse = IResponse<ISkillDetail>

/** 获取技能详情（含流程节点） */
export function useGetSkillDetailQuery(skillId: Ref<string>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ISkillDetailResponse, Error>({
    queryKey: ['skillDetail', skillId],
    queryFn: async () => await apiFetch<ISkillDetailResponse>(`/skill/detail/${skillId.value}`),
    retry: false,
    refetchOnMount: 'always',
  })
}

/** 图片生成响应 */
export type IAIImageGenerationResponse = IResponse<IAIImageGeneration>

/** 提交速创平台图片生成 */
export function useCreateImageGenerationMutation() {
  const { apiFetch } = useApiFetch()

  return useMutation<IAIImageGenerationResponse, Error, IQuicklyCreateRequest>({
    mutationKey: ['createImageGeneration'],
    mutationFn: async data => await apiFetch<IAIImageGenerationResponse>('/aiImage/quicklyCreate/generations', {
      method: 'post',
      body: data,
    }),
  })
}

/** 查询速创平台生成结果 */
export function useGetImageGenerationResultQuery(
  id: Ref<number | null>,
  status?: Ref<0 | 1 | 2 | null>,
) {
  const { apiFetch } = useApiFetch()

  return useQuery<IAIImageGenerationResponse, Error>({
    queryKey: ['imageGenerationResult', id],
    queryFn: async () => await apiFetch<IAIImageGenerationResponse>(`/aiImage/quicklyCreate/${id.value}`),
    enabled: computed(() => id.value !== null && status?.value !== 1 && status?.value !== 2),
    refetchInterval: computed(() => {
      // 只有状态为生成中（0 或 null）时才轮询
      if (id.value === null || status?.value === 1 || status?.value === 2)
        return false
      return 3000
    }),
    retry: false,
  })
}

/** 技能流程数据查询响应 */
export type ISkillFlowDataResponse = IResponse<ISkillFlowDataVO[]>

/** 技能流程数据查询参数 */
export interface ISkillFlowDataQuery {
  /** 内置数据源标识 */
  dataSourceBuiltin: string
  /** 商户编码 */
  merchantCode: string
}

/** 获取技能流程动态数据（dataSourceType=4 时使用） */
export function useGetSkillFlowDataQuery(query: Ref<ISkillFlowDataQuery | null>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ISkillFlowDataResponse, Error>({
    queryKey: ['skillFlowData', query],
    queryFn: async () => {
      if (!query.value)
        throw new Error('Query params is null')
      return await apiFetch<ISkillFlowDataResponse>('/skill/flow/data-search', {
        method: 'get',
        query: query.value,
      })
    },
    enabled: computed(() => query.value !== null),
    retry: false,
  })
}

/** 技能商户列表响应 */
export type ISkillMerchantListResponse = IResponse<ISkillMerchantVO[]>

/** 查询已分配该技能的商户/物业/居委会列表 */
export function useGetSkillMerchantsQuery(skillId: Ref<string>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ISkillMerchantListResponse, Error>({
    queryKey: ['skillMerchants', skillId],
    queryFn: async () => await apiFetch<ISkillMerchantListResponse>(`/skill/${skillId.value}/merchants`),
    enabled: computed(() => !!skillId.value),
    retry: false,
  })
}

/** 流程式对话响应 */
export type IFlowCompletionResponse = IResponse<IFlowCompletionVO>

/** 流程式对话（非流式）：提交向导表单，返回 aiContent + imageGenerationId + imageStatus */
export function useFlowCompletionMutation() {
  const { apiFetch } = useApiFetch()

  return useMutation<IFlowCompletionResponse, Error, IWizardSubmitForm>({
    mutationKey: ['flowCompletion'],
    mutationFn: async data => await apiFetch<IFlowCompletionResponse>('/agentScopeChat/flow/completion', {
      method: 'post',
      body: data,
    }),
  })
}

// ==================== 流式对话 API（Type 1/2）====================

/** 创建会话响应 */
export interface ICreateConversationResponse {
  chatId: number
  type: number
  conversationId: string
}

/** 创建会话 */
export function useCreateConversationMutation() {
  const { apiFetch } = useApiFetch()

  return useMutation<IResponse<ICreateConversationResponse>, Error, {
    skillId: string
    role: string
    content: string
    contentType?: string
    type?: string
  }>({
    mutationKey: ['createConversation'],
    mutationFn: async params => await apiFetch<IResponse<ICreateConversationResponse>>('/aiCommon/createConversation', {
      method: 'get',
      query: params,
    }),
  })
}

/** Coze 智能体详情响应 */
export type ICozeDetailResponse = IResponse<CozeBotDetailResp>

/** Coze 智能体详情 */
export function useGetCozeDetailQuery(botId: Ref<string>) {
  const { apiFetch } = useApiFetch()

  return useQuery<ICozeDetailResponse, Error>({
    queryKey: ['cozeDetail', botId],
    queryFn: async () => await apiFetch<ICozeDetailResponse>('/aiCommon/cozeOnlineInfo', {
      method: 'get',
      query: { botId: botId.value },
    }),
    enabled: computed(() => !!botId.value),
    retry: false,
  })
}

/** Agent 详情响应 */
export type IAgentDetailResponse = IResponse<AgentDetailResp>

/** Agent 详情 */
export function useGetAgentDetailQuery(agentId: Ref<string>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IAgentDetailResponse, Error>({
    queryKey: ['agentDetail', agentId],
    queryFn: async () => await apiFetch<IAgentDetailResponse>(`/aiCommon/agent/detail/${agentId.value}`),
    enabled: computed(() => !!agentId.value),
    retry: false,
  })
}

/** 消息列表查询参数 */
export interface IMessageListQuery {
  chatId: string
  pageNum: number
  pageSize: number
  searchCount?: boolean
}

/** 流式对话消息 */
export interface IStreamChatMessage {
  chatId: number
  role: string
  content: string
  contentType?: string
  showContent?: string
  reasoningContent?: string
  reasoningDuration?: number
  keywords?: string
  type: number
  senderId?: number
  receiverId?: number
  createTime: string
  agentId?: number
  systemPrompt?: string
  /** 流式消息ID，用于关联同一轮对话 */
  contentId?: string | number
}

/** 消息列表响应 */
export type IMessageListResponse = IResponse<IPageResult<IStreamChatMessage>>

/** 消息列表 */
export function useGetMessageListQuery(query: Ref<IMessageListQuery | null>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IMessageListResponse, Error>({
    queryKey: computed(() => ['messageList', query.value]),
    queryFn: async () => {
      if (!query.value)
        throw new Error('Query is null')
      return await apiFetch<IMessageListResponse>('/aiCommon/messageList', {
        method: 'get',
        query: query.value,
      })
    },
    enabled: computed(() => query.value !== null),
    retry: false,
  })
}

// ==================== Coze / Agent 类型定义 ====================

/** Coze 智能体详情 */
export interface CozeBotDetailResp {
  botID: string
  name: string
  description: string
  iconURL: string
  promptInfo?: { prompt: string }
  onboardingInfo?: {
    prologue: string
    suggestedQuestions: string[]
  }
  botMode: number
  pluginInfoList?: PluginInfo[]
  modelInfo?: ModelInfo
  knowledge?: Knowledge
  shortcutCommands?: ShortcutCommandInfo[]
  workflowInfoList?: WorkflowInfo[]
  backGroundImageInfo?: BackGroundImageInfo
  cityQuickCommands?: CityQuickCommand[]
  cityCozeBotInfo?: CityCozeBotInfo
}

export interface PluginInfo {
  pluginID: string
  name: string
  description: string
  iconURL: string
  apiInfoList?: PluginAPIInfo[]
}

export interface PluginAPIInfo {
  apiID: string
  name: string
  description: string
}

export interface ModelInfo {
  modelID: string
  modelName: string
  responseFormat: string
  maxTokens: number
  contextRound: number
}

export interface Knowledge {
  knowledgeInfos?: KnowledgeInfo[]
}

export interface KnowledgeInfo {
  id: string
  name: string
}

export interface ShortcutCommandInfo {
  id: string
  name: string
  command: string
  agentId: string
  description: string
  queryTemplate: string
  iconUrl: string
  components?: Component[]
  tool?: Tool
}

export interface Component {
  name: string
  description: string
  type: string
  toolParameter: string
  defaultValue: string
  options: string[]
  isHide: boolean
}

export interface Tool {
  name: string
  type: string
}

export interface WorkflowInfo {
  id: string
  name: string
  iconUrl: string
  description: string
}

export interface BackGroundImageInfo {
  webBackgroundImage?: BackgroundImageDetail
  mobileBackgroundImage?: BackgroundImageDetail
}

export interface BackgroundImageDetail {
  imageUrl: string
  themeColor: string
  canvasPosition?: CanvasPosition
  gradientPosition?: GradientPosition
}

export interface CanvasPosition {
  top: number
  left: number
  width: number
  height: number
}

export interface GradientPosition {
  left: number
  right: number
}

export interface CityQuickCommand {
  uniqueCode: string
  icon: string
  name: string
  description: string
  aiVerbalTrick: string
  aiPhone: string
  type: number
  triggerType: number
  content: string
  contentType: string
}

export interface CityCozeBotInfo {
  loginType: number
  poster: string
  welcomePoster: string
  topPoster: string
  aiLibrarianPoster: string
  aiLibrarian: string
  questionNumber: number
  voiceId: string
}

/** Agent 详情 */
export interface AgentDetailResp {
  agentId: string
  aiProvider: number
  model: string
  type: number
  name: string
  description: string
  icon: string
  greeting: string
  systemPrompt: string
  thirdId: string
  promptGuideList: string[] | null
  promptTemplateList: AgentPromptTemplate[]
  /** Agent MCP 方法名，流式对话时传给后端 */
  mcpMethod?: string
  /** 可视化能力列表 */
  agentVisionList?: AgentVision[]
  enableAudioFlag: boolean
  voiceId: string
  agentKey: string | null
  runtimeType: string | null
  cozeBotInfo?: CozeBotDetailResp
}

export interface AgentPromptTemplate {
  agentPromptTemplateId: string
  templateName: string
  templateDesc: string
  templateForm: string
  subtitle: string
}

/** Agent 可视化能力 */
export interface AgentVision {
  id: string
  name: string
  visionAliasName: string
  visionType: 1 | 2 | 3
  visionAgentId: string
  visionContent?: string
  done?: boolean
}

/** 商户发起人工接管 */
export function useManualTakeoverMutation() {
  const { apiFetch } = useApiFetch()

  return useMutation<IResponse<boolean>, Error, { chatId: string }>({
    mutationKey: ['manualTakeover'],
    mutationFn: async data => await apiFetch<IResponse<boolean>>('/aiCommon/manualTakeover', {
      method: 'post',
      params: data,
    }),
  })
}
