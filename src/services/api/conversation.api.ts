import { useQuery } from '@tanstack/vue-query'

import type { IWizardStepForm } from '@/pages/apps/types/wizard.types'

import { useApiFetch } from '@/composables/use-fetch'

import type { IResponse } from '../types/response.type'
import type { IStreamChatMessage } from './skill.api'

// ==================== 图片生成结果查询类型 ====================

/** AI图片生成信息 VO */
export interface IAIImageGeneration {
  /** 主键 */
  id: number
  /** 会话ID */
  chatId: string
  /** 调用用户 ID */
  userId: number
  /** 平台标识 */
  provider: string
  /** 模型名称 */
  model: string
  /** 提示词 */
  prompt: string
  /** 图片尺寸 */
  size: string
  /** 图片质量 */
  quality: string
  /** 背景类型 */
  background: string
  /** 输出格式 */
  outputFormat: string
  /** OSS 图片地址 */
  imageUrl: string
  /** 参考图片URL */
  referenceImageUrl: string[]
  /** 生成状态：0-生成中 1-成功 2-失败 */
  status: 0 | 1 | 2
  /** 输入 token 数 */
  inputTokens: number
  /** 输出 token 数 */
  outputTokens: number
  /** 总 token 数 */
  totalTokens: number
  /** OpenAI 返回的创建时间戳 */
  created: number
  /** 外部平台任务ID */
  taskId: string
}

/** 图片生成结果响应 */
export type IImageGenerationResponse = IResponse<IAIImageGeneration>

/** 服务模式：0-AI托管 1-人工接管 2-待人工介入 9-数字员工 */
export type ServiceMode = 0 | 1 | 2 | 9

/** 用户标签：3-站长 4-商户 5-物业 6-居委会 7-居民 */
export type UserTag = 3 | 4 | 5 | 6 | 7

/** 服务模式映射配置 */
export const serviceModeConfig: Record<ServiceMode, { label: string, variant: 'default' | 'secondary' | 'destructive' | 'info' }> = {
  0: { label: 'AI托管', variant: 'default' },
  1: { label: '人工接管', variant: 'secondary' },
  2: { label: '待人工介入', variant: 'destructive' },
  9: { label: '数字员工', variant: 'info' },
}

/** 用户标签映射配置 */
export const userTagConfig: Record<UserTag, string> = {
  3: '站长',
  4: '商户',
  5: '物业',
  6: '居委会',
  7: '居民',
}

/** 会话信息 VO */
export interface IConversation {
  /** 会话ID */
  chatId: string
  /** 会话标题 */
  title: string
  /** 用户ID */
  userId: number
  /** 类型 */
  type: number
  /** 技能ID */
  skillId: string
  /** 第三方平台ID：type 1/2 时用于调用详情接口 */
  thirdId: string
  /** 小区站长ID */
  orgCode: string
  /** 服务模式：0-AI托管 1-人工接管 2-待人工介入 9-数字员工 */
  serviceMode: ServiceMode
  /** 当前接管人ID */
  operatorId: number
  /** 当前接管人名称 */
  operatorName: string
  /** 用户标签：3-站长 4-商户 5-物业 6-居委会 7-居民 */
  userTag: UserTag
  /** 商户编码（用于获取商户的动态数据） */
  merchantCode: string
  /** 接管时间 */
  takeoverTime: string
  /** 切回AI时间 */
  returnToAiTime: string
  /** 待处理消息数（人工模式下站长未读） */
  pendingCount: number
  /** 最后消息时间 */
  lastMessageTime: string
  /** 最后消息预览 */
  lastMessagePreview: string
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

/** 会话列表查询参数 */
export interface IConversationListQuery {
  /** 查询状态：空-全部，1-待介入，2-已完成 */
  status?: string
  /** 页码 */
  pageNum: number
  /** 每页数量 */
  pageSize: number
  /** 是否查询总条数 */
  searchCount?: string
  /** 排序字段集合 */
  sortItemList?: string
}

/** 会话列表响应 */
export type IConversationListResponse = IResponse<IPageResult<IConversation>>

// ==================== 会话详情类型定义 ====================

/** 消息部分 VO */
export interface IMessagePart {
  /** 部分类型：reasoning(思考过程)/text(文本内容)/tool_call(工具调用)/artifact(创作产物) */
  type: string
  /** 内容文本 */
  content: string
  /** 耗时（毫秒） */
  duration?: number
}

/** 消息附件 VO */
export interface IFileAttachment {
  /** 文件ID */
  fileId: number
  /** 文件名 */
  fileName: string
  /** 文件类型 */
  fileType: string
  /** 文件大小（字节） */
  fileSize: number
  /** 文件预览URL */
  fileUrl: string
}

/** 思考片段 VO */
export interface IReasoningSegment {
  /** 消息ID */
  messageId: string
  /** 思考内容 */
  content: string
  /** 耗时（毫秒） */
  duration?: number
}

/** 消息 VO */
export interface IChatMessage {
  /** 消息ID */
  id: string
  /** 会话ID */
  chatId: string
  /** 消息角色：user/assistant */
  role: string
  /** 消息内容（兼容旧版，建议使用parts） */
  content: string
  /** 最终完整内容 */
  finalContent: string
  /** 消息部分列表（AI回复的结构化内容） */
  parts: IMessagePart[]
  /** 附件文件列表 */
  attachments: IFileAttachment[]
  /** 创建时间 */
  createTime: string
  /** 分段思考内容列表 */
  reasoningSegments: IReasoningSegment[]
  /** 关联的图片生成记录ID */
  imageGenerationId: number
  /** 流程步骤数据（用户选择记录） */
  steps: IWizardStepForm[] | null
  /** 流式对话消息ID：用于关联同一轮对话的 user 和 assistant 消息 */
  contentId?: string
}

/** 创作产物 VO */
export interface IResidentialArtifact {
  /** 产物ID（MongoDB） */
  id: string
  /** 关联会话ID */
  chatId: string
  /** 产物ID（来自SDK） */
  artifactId: string
  /** 展示ID */
  displayId: string
  /** 产物类型 */
  artifactType: string
  /** 产物状态 */
  status: string
  /** 产物标题 */
  title: string
  /** 产物摘要 */
  summary: string
  /** 文件格式 */
  format: string
  /** 文件URL */
  fileUrl: string
  /** 文件名 */
  fileName: string
  /** 创建时间 */
  createTime: string
}

/** 会话详情 VO */
export interface IConversationDetail {
  /** 会话ID */
  chatId: string
  /** 会话标题 */
  title: string
  /** 用户ID */
  userId: number
  /** 类型 */
  type: number
  /** 技能ID */
  skillId: string
  /** 小区站长ID */
  orgCode: string
  /** 服务模式：0-AI托管 1-人工接管 2-待人工介入 9-数字员工 */
  serviceMode: ServiceMode
  /** 当前接管人ID */
  operatorId: number
  /** 当前接管人名称 */
  operatorName: string
  /** 用户标签：3-站长 4-商户 5-物业 6-居委会 7-居民 */
  userTag: UserTag
  /** 商户编码（用于获取商户的动态数据） */
  merchantCode: string
  /** 接管时间 */
  takeoverTime: string
  /** 切回AI时间 */
  returnToAiTime: string
  /** 待处理消息数（人工模式下站长未读） */
  pendingCount: number
  /** 最后消息时间 */
  lastMessageTime: string
  /** 最后消息预览 */
  lastMessagePreview: string
  /** 消息列表 */
  messages: IChatMessage[]
  /** 创作产物列表 */
  artifacts: IResidentialArtifact[]
}

/** 会话详情响应 */
export type IConversationDetailResponse = IResponse<IConversationDetail>

// ==================== API 封装 ====================

/** 获取会话分页列表 */
export function useGetConversationListQuery(query: Ref<IConversationListQuery>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IConversationListResponse, Error>({
    queryKey: ['conversationList', query],
    queryFn: async () => await apiFetch<IConversationListResponse>('/aiCommon/conversationList', {
      method: 'get',
      query: query.value,
    }),
    retry: false,
  })
}

/** 获取会话详情（包含消息历史） */
export function useGetConversationDetailQuery(chatId: Ref<string>, enabled?: Ref<boolean>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IConversationDetailResponse, Error>({
    queryKey: ['conversationDetail', chatId],
    queryFn: async () => await apiFetch<IConversationDetailResponse>(`/agentScopeChat/conversation/${chatId.value}`, {
      method: 'get',
    }),
    enabled: computed(() => !!chatId.value && (enabled?.value ?? true)),
    retry: false,
  })
}

/** 获取图片生成结果（速创平台） */
export function useGetImageGenerationQuery(imageGenerationId: Ref<number | undefined>) {
  const { apiFetch } = useApiFetch()

  return useQuery<IImageGenerationResponse, Error>({
    queryKey: ['imageGeneration', imageGenerationId],
    queryFn: async () => await apiFetch<IImageGenerationResponse>(`/aiImage/quicklyCreate/${imageGenerationId.value}`, {
      method: 'get',
    }),
    enabled: computed(() => !!imageGenerationId.value && imageGenerationId.value > 0),
    retry: false,
    refetchInterval: (query) => {
      const data = query.state.data
      // 生成中状态(0)时轮询，成功(1)或失败(2)停止
      if (data?.data?.status === 0) {
        return 3000 // 3秒轮询
      }
      return false
    },
  })
}

/** 将流式消息列表转换为 IChatMessage */
export function convertStreamMessagesToChatMessages(history: IStreamChatMessage[]): IChatMessage[] {
  return history.map(msg => ({
    id: `${msg.chatId}-${msg.createTime}`,
    chatId: String(msg.chatId),
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content || msg.showContent || '',
    finalContent: msg.showContent || msg.content || '',
    parts: [],
    attachments: [],
    createTime: msg.createTime,
    reasoningSegments: msg.reasoningContent
      ? [{ messageId: `${msg.chatId}-${msg.createTime}`, content: msg.reasoningContent, duration: msg.reasoningDuration }]
      : [],
    imageGenerationId: 0,
    steps: null,
    contentId: msg.contentId ? String(msg.contentId) : undefined,
  }))
}
