import { computed, reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner'

import type { IChatMessage } from '@/services/api/conversation.api'
import type { EmployeeAiType } from '@/services/api/digital-employee.api'
import type { IMessageListQuery } from '@/services/api/skill.api'

import { createStreamUrl, useTextStream } from '@/composables/use-text-stream'
import { convertStreamMessagesToChatMessages } from '@/services/api/conversation.api'
import { useCreateConversationMutation, useGetMessageListQuery } from '@/services/api/skill.api'
import { mergeStreamText } from '@/utils/stream-text'

/** SSE 事件对象 */
interface SSEEvent {
  event: string
  data: Record<string, any>
}

/** 发送消息的可选参数（Agent 类型需传入） */
interface SendMessageOptions {
  /** Agent 第三方 ID（=aiThirdId） */
  agentId?: string
  /** Agent MCP 方法名 */
  mcpMethod?: string
}

/** 创建一条空的 IChatMessage */
function createMessage(partial: Partial<IChatMessage>): IChatMessage {
  return {
    id: '',
    chatId: '',
    role: 'assistant',
    content: '',
    finalContent: '',
    parts: [],
    attachments: [],
    createTime: new Date().toISOString(),
    reasoningSegments: [],
    imageGenerationId: '',
    steps: null,
    contentId: undefined,
    ...partial,
  }
}

/**
 * 数字员工流式对话状态管理
 *
 * 复用现有 createConversation + /aiChat/chat/stream/completion 流式接口，
 * 与 apps/use-chat-stream 的差异：
 * - employeeId 即流式接口中的 skillId
 * - aiType 即 type（1=Coze 传 aiChatType:201，2=Agent）
 * - 支持注入一条本地开场白消息（展示用，不发送给后端）
 * - 传入 initialChatId 时加载该会话历史消息（如从“查看详情”进入），否则为新会话
 *
 * @param employeeId 数字员工ID（=skillId）
 * @param aiType AI类型 1=Coze, 2=Agent
 * @param welcomeContent 开场白内容（可选，作为首条 AI 消息展示）
 * @param initialChatId 初始会话ID（可选，从会话列表/详情进入时传入，用于加载历史）
 */
export function useEmployeeChatStream(
  employeeId: Ref<string>,
  aiType: Ref<EmployeeAiType>,
  welcomeContent?: Ref<string>,
  initialChatId?: Ref<string | null>,
) {
  // ==================== 消息列表 ====================
  const messages = ref<IChatMessage[]>([])

  /** 本地开场白消息ID：仅用于展示，构建历史时排除 */
  const welcomeMessageId = 'welcome-message'

  /** 注入/更新开场白消息 */
  function seedWelcomeMessage() {
    const content = welcomeContent?.value?.trim()
    if (!content)
      return
    const existing = messages.value.find(m => m.id === welcomeMessageId)
    if (existing) {
      existing.content = content
      return
    }
    messages.value.unshift(createMessage({
      id: welcomeMessageId,
      role: 'assistant',
      content,
    }))
  }

  // ==================== 会话状态 ====================
  const chatId = ref<string | null>(initialChatId?.value ?? null)
  const conversationId = ref('')
  const isFirstMessage = computed(() => chatId.value === null)

  // ==================== 历史消息加载 ====================
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
    // 仅在消息列表为空时加载历史，避免聊天过程中覆盖当前消息
    if (data?.data?.list && messages.value.length === 0) {
      messages.value = convertStreamMessagesToChatMessages(data.data.list)
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

  /**
   * 发送消息（流式）
   * @param content 用户输入内容
   * @param options 可选参数，Agent 类型需传入 agentId 和 mcpMethod
   */
  async function sendMessage(content: string, options?: SendMessageOptions) {
    if (!content.trim() || isStreaming.value)
      return

    // 添加用户消息
    const userMsg = createMessage({
      id: `user-${Date.now()}`,
      role: 'user',
      content,
    })
    messages.value.push(userMsg)

    // 添加 AI 占位消息（reactive 使内容更新可追踪）
    const aiMsg = reactive<IChatMessage>(createMessage({
      id: `ai-${Date.now()}`,
      role: 'assistant',
    }))
    messages.value.push(aiMsg)

    // 首次对话：先创建会话
    if (isFirstMessage.value) {
      try {
        const result = await createConversationMutation.mutateAsync({
          skillId: employeeId.value,
          role: 'user',
          content,
          type: String(aiType.value),
        })

        if (result.code === 0 && result.data) {
          chatId.value = String(result.data.chatId)
          conversationId.value = result.data.conversationId
        }
        else {
          throw new Error(result.msg || '创建会话失败')
        }
      }
      catch (error) {
        const msg = error instanceof Error ? error.message : '创建会话失败'
        aiMsg.content = msg
        errorMessageIds.value.add(aiMsg.id)
        toast.error(msg)
        return
      }
    }

    await doStreamCompletion(aiMsg, options)
  }

  /**
   * 构建发送给后端的对话历史
   * 排除开场白、错误消息和内容为空的消息
   */
  function buildChatMessages(): Array<{ role: string, content: string, skillId: string, contentId?: string }> {
    return messages.value
      .filter((msg) => {
        const isChatRole = msg.role === 'user' || msg.role === 'assistant'
        const hasContent = !!(msg.content || msg.finalContent)
        const isError = errorMessageIds.value.has(msg.id)
        const isWelcome = msg.id === welcomeMessageId
        return isChatRole && hasContent && !isError && !isWelcome
      })
      .map(msg => ({
        role: msg.role,
        content: msg.content || msg.finalContent,
        skillId: employeeId.value,
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
            aiChatType: aiType.value === 1 ? 201 : undefined,
            agentId: options?.agentId,
            mcpMethod: options?.mcpMethod,
            aiChatMessages: buildChatMessages(),
          }),
          onMessage(event) {
            handleStreamEvent(event, aiMsg)
          },
          onReasoning(event) {
            isReasoning.value = true
            reasoningContent.value = mergeStreamText(
              reasoningContent.value,
              event.data.reasoningContent,
              event.data.fullFlag,
            )
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

    if (data.conversationId) {
      conversationId.value = data.conversationId
    }

    // [DATA] 正常消息内容
    if (eventName === '[DATA]') {
      isReasoning.value = false
      if (data.content) {
        currentStreamContent.value = mergeStreamText(currentStreamContent.value, data.content, data.fullFlag)
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
      // 续聊时后端需要每条历史消息带 contentId,否则 500
      const lastAssistantIndex = messages.value.length - 1
      const lastUserIndex = messages.value.length - 2
      if (
        lastUserIndex >= 0
        && messages.value[lastAssistantIndex]?.contentId
        && messages.value[lastUserIndex]?.role === 'user'
      ) {
        messages.value[lastUserIndex].contentId = messages.value[lastAssistantIndex].contentId
      }
      // 仅在还没有 chatId 时从 [DONE] 的 content 中解析，避免精度丢失
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
      reasoningContent.value = mergeStreamText(reasoningContent.value, data.reasoningContent, data.fullFlag)
      return
    }

    // [REASONING_END] 推理结束
    if (eventName === '[REASONING_END]') {
      isReasoning.value = false
    }
  }

  // ==================== 停止生成 ====================
  function stopGeneration() {
    abortStream.value?.()
    abortStream.value = undefined
    isStreaming.value = false
    isReasoning.value = false
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
    seedWelcomeMessage,
  }
}
