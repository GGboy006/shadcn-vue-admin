import { computed, reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner'

import type { IChatMessage } from '@/services/api/conversation.api'
import type { IMessageListQuery, IStreamChatMessage } from '@/services/api/skill.api'

import { createStreamUrl, useTextStream } from '@/composables/use-text-stream'
import { convertStreamMessagesToChatMessages } from '@/services/api/conversation.api'
import { useCreateConversationMutation, useGetMessageListQuery } from '@/services/api/skill.api'

/** 聊天角色 */
export type ChatRole = 'user' | 'assistant'

/** SSE 事件对象 */
interface SSEEvent {
  event: string
  data: Record<string, any>
}

/** 发送消息的可选参数 */
interface SendMessageOptions {
  /** Agent 第三方 ID */
  agentId?: string
  /** Agent MCP 方法名 */
  mcpMethod?: string
}

/**
 * 流式对话状态管理
 * @param skillId 技能ID
 * @param skillType 技能类型 1=Coze, 2=Agent
 * @param initialChatId 初始会话ID（从会话列表进入时传入）
 */
export function useChatStream(
  skillId: Ref<string>,
  skillType: Ref<1 | 2>,
  initialChatId?: Ref<string | null>,
) {
  // ==================== 消息列表 ====================
  const messages = ref<IChatMessage[]>([])

  // ==================== 会话状态 ====================
  const chatId = ref<string | null>(initialChatId?.value ?? null)
  const conversationId = ref('')
  const isFirstMessage = computed(() => chatId.value === null)

  // ==================== 历史消息查询 ====================
  const messageListQuery = ref<IMessageListQuery | null>(null)

  watch(() => chatId.value, (newChatId, oldChatId) => {
    if (newChatId && newChatId !== oldChatId) {
      // 只有真正切换会话时才清空消息；
      // 首次创建会话（oldChatId 为 null/undefined）时不清空，避免刚发送的消息被清掉
      if (oldChatId) {
        messages.value = []
      }
      messageListQuery.value = {
        chatId: newChatId,
        pageNum: 1,
        pageSize: 100,
        searchCount: false,
      }
    }
  }, { immediate: true })

  const { data: messageListData } = useGetMessageListQuery(messageListQuery)

  watch(() => messageListData.value, (data) => {
    // 只在消息列表为空时加载历史消息，避免聊天过程中覆盖当前消息
    if (data?.data?.list && messages.value.length === 0) {
      messages.value = convertHistoryToMessages(data.data.list)
    }
  }, { immediate: true })

  // ==================== 流式状态 ====================
  const isStreaming = ref(false)
  const isReasoning = ref(false)
  const currentStreamContent = ref('')
  const reasoningContent = ref('')

  // ==================== 错误消息记录 ====================
  const errorMessageIds = ref<Set<string>>(new Set())

  // ==================== 取消控制器 ====================
  const abortStream = ref<(() => void) | undefined>(undefined)

  // ==================== 创建会话 ====================
  const createConversationMutation = useCreateConversationMutation()

  // ==================== 发送消息 ====================

  /**
   * 发送消息（流式）
   * @param content 用户输入内容
   * @param options 可选参数，Agent 类型需传入 agentId 和 mcpMethod
   */
  async function sendMessage(content: string, options?: SendMessageOptions) {
    if (!content.trim() || isStreaming.value)
      return

    // 添加用户消息
    const userMsg: IChatMessage = {
      id: `user-${Date.now()}`,
      chatId: '',
      role: 'user',
      content,
      finalContent: '',
      parts: [],
      attachments: [],
      createTime: new Date().toISOString(),
      reasoningSegments: [],
      imageGenerationId: 0,
      steps: null,
      contentId: undefined,
    }
    messages.value.push(userMsg)

    // 添加 AI 占位消息（用 reactive 包裹，使内容更新可追踪）
    const aiMsgId = `ai-${Date.now()}`
    const aiMsg = reactive<IChatMessage>({
      id: aiMsgId,
      chatId: '',
      role: 'assistant',
      content: '',
      finalContent: '',
      parts: [],
      attachments: [],
      createTime: new Date().toISOString(),
      reasoningSegments: [],
      imageGenerationId: 0,
      steps: null,
      contentId: undefined,
    })
    messages.value.push(aiMsg)

    // 首次对话：先创建会话
    if (isFirstMessage.value) {
      try {
        const result = await createConversationMutation.mutateAsync({
          skillId: skillId.value,
          role: 'user',
          content,
          type: String(skillType.value),
        })

        if (result.code === 0 && result.data) {
          // URL 已传入字符串 chatId 时优先保留，避免后端 number 精度丢失导致会话切换
          if (!chatId.value) {
            chatId.value = String(result.data.chatId)
          }
          conversationId.value = result.data.conversationId
        }
        else {
          throw new Error(result.message || '创建会话失败')
        }
      }
      catch (error) {
        const msg = error instanceof Error ? error.message : '创建会话失败'
        aiMsg.content = msg
        errorMessageIds.value.add(aiMsg.id)
        toast.error(msg)
        console.error('[sendMessage] 创建会话失败:', msg)
        return
      }
    }

    // 调用流式接口
    await doStreamCompletion(aiMsg, options)
  }

  /**
   * 构建发送给后端的对话历史
   * 排除错误消息和内容为空的消息
   */
  function buildChatMessages(): Array<{ role: string, content: string, skillId: string, contentId?: string }> {
    return messages.value
      .filter((msg) => {
        const isChatRole = msg.role === 'user' || msg.role === 'assistant'
        const hasContent = !!(msg.content || msg.finalContent)
        const isError = errorMessageIds.value.has(msg.id)
        return isChatRole && hasContent && !isError
      })
      .map(msg => ({
        role: msg.role,
        content: msg.content || msg.finalContent,
        skillId: skillId.value,
        contentId: msg.contentId,
      }))
  }

  /**
   * 执行流式对话
   */
  async function doStreamCompletion(aiMsg: IChatMessage, options?: SendMessageOptions) {
    if (!chatId.value) {
      aiMsg.content = '会话未创建'
      return
    }

    isStreaming.value = true
    isReasoning.value = false
    currentStreamContent.value = ''
    reasoningContent.value = ''

    const { createTextSSE } = useTextStream()

    try {
      await new Promise<void>((resolve, reject) => {
        const { abort } = createTextSSE({
          url: createStreamUrl('/aiChat/chat/stream/completion'),
          body: JSON.stringify({
            chatId: chatId.value,
            aiChatType: skillType.value === 1 ? 201 : undefined,
            agentId: options?.agentId,
            mcpMethod: options?.mcpMethod,
            aiChatMessages: buildChatMessages(),
          }),
          onMessage(event) {
            handleStreamEvent(event, aiMsg)
          },
          onReasoning(event) {
            isReasoning.value = true
            if (event.data.reasoningContent) {
              reasoningContent.value += event.data.reasoningContent
            }
          },
          onReasoningEnd(event) {
            isReasoning.value = false
            handleStreamEvent(event, aiMsg)
          },
          onDone(event) {
            handleStreamEvent(event, aiMsg)
            isStreaming.value = false
            isReasoning.value = false
            resolve()
          },
          onError(err) {
            isStreaming.value = false
            isReasoning.value = false
            aiMsg.content = err?.data?.content || err?.message || '请求失败'
            toast.error('对话请求失败')
            reject(err)
          },
        })

        abortStream.value = abort
      })
    }
    catch {
      isStreaming.value = false
      isReasoning.value = false
      if (!aiMsg.content) {
        aiMsg.content = '请求异常'
      }
      toast.error('对话请求异常')
    }
    finally {
      abortStream.value = undefined
    }
  }

  /**
   * 处理 SSE 流事件
   */
  function handleStreamEvent(event: SSEEvent, aiMsg: IChatMessage) {
    const eventName = event.event
    const data = event.data

    // 更新会话ID
    if (data.conversationId) {
      conversationId.value = data.conversationId
    }

    // [DATA] 正常消息内容
    if (eventName === '[DATA]') {
      isReasoning.value = false
      if (data.content) {
        currentStreamContent.value += data.content
        aiMsg.content = currentStreamContent.value
      }
      if (data.id) {
        aiMsg.contentId = String(data.id)
      }
      return
    }

    // [DONE] 对话完成
    if (eventName === '[DONE]') {
      isStreaming.value = false
      isReasoning.value = false
      // 把当前 assistant 消息的 contentId 同步给前一条 user 消息
      const lastAssistantIndex = messages.value.length - 1
      const lastUserIndex = messages.value.length - 2
      if (
        lastUserIndex >= 0
        && messages.value[lastAssistantIndex]?.contentId
        && messages.value[lastUserIndex]?.role === 'user'
      ) {
        messages.value[lastUserIndex].contentId = messages.value[lastAssistantIndex].contentId
      }
      // 仅在还没有 chatId 时从 [DONE] 的 content 中解析，避免 number 精度丢失覆盖已有值
      if (!chatId.value && data.content) {
        try {
          const doneData = JSON.parse(data.content)
          if (doneData.chatId) {
            chatId.value = String(doneData.chatId)
          }
        }
        catch {
          // ignore
        }
      }
      return
    }

    // [ERROR] / [FAILED] 错误
    if (eventName === '[ERROR]' || eventName === '[FAILED]') {
      isStreaming.value = false
      isReasoning.value = false
      aiMsg.content = data.content || '请求失败'
      errorMessageIds.value.add(aiMsg.id)
      return
    }

    // [PARAGRAPH_END] 段落结束，忽略
    if (eventName === '[PARAGRAPH_END]') {
      return
    }

    // [CHAT_MESSAGE] 元数据事件，不显示
    if (eventName === '[CHAT_MESSAGE]') {
      return
    }

    // [REASONING] 推理中
    if (eventName === '[REASONING]') {
      isReasoning.value = true
      if (data.reasoningContent) {
        reasoningContent.value += data.reasoningContent
      }
      return
    }

    // [REASONING_END] 推理结束
    if (eventName === '[REASONING_END]') {
      isReasoning.value = false
    }
  }

  // ==================== 停止生成 ====================

  /**
   * 停止生成
   */
  function stopGeneration() {
    abortStream.value?.()
    abortStream.value = undefined
    isStreaming.value = false
    isReasoning.value = false
  }

  // ==================== 加载历史消息 ====================

  /**
   * 从历史消息数据转换为 IChatMessage
   * @deprecated 请使用 conversation.api.ts 中的 convertStreamMessagesToChatMessages
   */
  function convertHistoryToMessages(history: IStreamChatMessage[]): IChatMessage[] {
    return convertStreamMessagesToChatMessages(history)
  }

  // ==================== 重置 ====================

  function reset() {
    messages.value = []
    chatId.value = null
    conversationId.value = ''
    isStreaming.value = false
    isReasoning.value = false
    currentStreamContent.value = ''
    reasoningContent.value = ''
    abortStream.value = undefined
    errorMessageIds.value.clear()
    messageListQuery.value = null
  }

  return {
    // 状态
    messages,
    chatId,
    conversationId,
    isFirstMessage,
    isStreaming,
    isReasoning,
    currentStreamContent,
    reasoningContent,

    // 方法
    sendMessage,
    stopGeneration,
    convertHistoryToMessages,
    reset,
  }
}
