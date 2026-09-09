import { computed, reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner'

import type { IChatMessage } from '@/services/api/conversation.api'
import type { EmployeeAiType } from '@/services/api/digital-employee.api'
import type { IMessageListQuery } from '@/services/api/skill.api'

import { createStreamUrl, useTextStream } from '@/composables/use-text-stream'
import { convertStreamMessagesToChatMessages, useGetConversationDetailQuery } from '@/services/api/conversation.api'
import { useCreateConversationMutation, useGetMessageListQuery } from '@/services/api/skill.api'
import { applyAgUiEvent, createAgUiStreamState } from '@/utils/ag-ui-stream'
import { applyPartsToMessage, hydrateChatMessage } from '@/utils/chat-message-parts'
import { mergeStreamText } from '@/utils/stream-text'

interface SSEEvent {
  event: string
  data: Record<string, any>
}

interface SendMessageOptions {
  agentId?: string
  mcpMethod?: string
}

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
 * 数字员工流式对话。
 *
 * type=3 AgentScope：AG-UI `/agentScopeChat/chat/stream/completion`，历史走 conversation 详情。
 * type=1/2：LoongAI `/aiChat/chat/stream/completion`，历史走 messageList。
 */
export function useEmployeeChatStream(
  employeeId: Ref<string>,
  aiType: Ref<EmployeeAiType | undefined>,
  welcomeContent?: Ref<string>,
  initialChatId?: Ref<string | null>,
) {
  const messages = ref<IChatMessage[]>([])
  const welcomeMessageId = 'welcome-message'

  function seedWelcomeMessage() {
    const content = welcomeContent?.value?.trim()
    if (!content)
      return
    const existing = messages.value.find(m => m.id === welcomeMessageId)
    if (existing) {
      existing.content = content
      applyPartsToMessage(existing, { text: content })
      return
    }
    messages.value.unshift(createMessage({
      id: welcomeMessageId,
      role: 'assistant',
      content,
      parts: [{ type: 'text', content }],
    }))
  }

  const chatId = ref<string | null>(initialChatId?.value ?? null)
  const conversationId = ref('')
  /** 以创建会话返回的 type 为准；历史进入时先用员工 aiType */
  const sessionType = ref<number | null>(null)
  const isFirstMessage = computed(() => chatId.value === null)
  const protocolReady = computed(() => aiType.value === 1 || aiType.value === 2 || aiType.value === 3)
  const isAgentScope = computed(() => (sessionType.value ?? aiType.value) === 3)

  const messageListQuery = ref<IMessageListQuery | null>(null)

  watch(
    [chatId, aiType],
    ([newChatId], oldValues) => {
      if (!newChatId || !protocolReady.value)
        return
      const oldChatId = oldValues?.[0]
      if (oldChatId && oldChatId !== newChatId)
        messages.value = []
      if (isAgentScope.value) {
        messageListQuery.value = null
        return
      }
      messageListQuery.value = {
        chatId: newChatId,
        pageNum: 1,
        pageSize: 100,
        searchCount: false,
      }
    },
    { immediate: true },
  )

  const { data: messageListData } = useGetMessageListQuery(messageListQuery)

  watch(() => messageListData.value, (data) => {
    if (isAgentScope.value)
      return
    if (data?.data?.list && messages.value.length === 0)
      messages.value = convertStreamMessagesToChatMessages(data.data.list)
  }, { immediate: true })

  const detailChatId = computed(() => (isAgentScope.value && chatId.value) || '')
  const detailEnabled = computed(() => isAgentScope.value && !!chatId.value && protocolReady.value)
  const { data: conversationDetail } = useGetConversationDetailQuery(detailChatId, detailEnabled)

  watch(() => conversationDetail.value, (data) => {
    if (!isAgentScope.value || messages.value.length > 0)
      return
    const list = data?.data?.messages
    if (list?.length)
      messages.value = list.map(hydrateChatMessage)
  }, { immediate: true })

  const isStreaming = ref(false)
  const isReasoning = ref(false)
  const currentStreamContent = ref('')
  const reasoningContent = ref('')
  const errorMessageIds = ref<Set<string>>(new Set())
  const abortStream = ref<(() => void) | undefined>(undefined)
  const createConversationMutation = useCreateConversationMutation()

  async function sendMessage(content: string, options?: SendMessageOptions) {
    if (!content.trim() || isStreaming.value || !protocolReady.value)
      return

    const userMsg = createMessage({
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      parts: [{ type: 'text', content }],
    })
    messages.value.push(userMsg)

    const aiMsg = reactive<IChatMessage>(createMessage({
      id: `ai-${Date.now()}`,
      role: 'assistant',
    }))
    messages.value.push(aiMsg)

    if (isFirstMessage.value) {
      try {
        const result = await createConversationMutation.mutateAsync({
          skillId: employeeId.value,
          role: 'user',
          content,
        })

        if (result.code === 0 && result.data) {
          chatId.value = String(result.data.chatId)
          conversationId.value = result.data.conversationId
          sessionType.value = result.data.type
        }
        else {
          throw new Error(result.msg || '创建会话失败')
        }
      }
      catch (error) {
        const msg = error instanceof Error ? error.message : '创建会话失败'
        applyPartsToMessage(aiMsg, { text: msg })
        errorMessageIds.value.add(aiMsg.id)
        toast.error(msg)
        return
      }
    }

    await doStreamCompletion(aiMsg, content, options)
  }

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

  function syncLoongAiParts(aiMsg: IChatMessage) {
    applyPartsToMessage(aiMsg, {
      text: currentStreamContent.value,
      reasoning: reasoningContent.value,
    })
  }

  async function doStreamCompletion(aiMsg: IChatMessage, userContent: string, options?: SendMessageOptions) {
    if (!chatId.value) {
      applyPartsToMessage(aiMsg, { text: '会话未创建' })
      return
    }

    isStreaming.value = true
    isReasoning.value = false
    currentStreamContent.value = ''
    reasoningContent.value = ''

    if (isAgentScope.value)
      await doAgentScopeStream(aiMsg, userContent)
    else
      await doLoongAiStream(aiMsg, options)
  }

  async function doAgentScopeStream(aiMsg: IChatMessage, userContent: string) {
    const { createJsonSSE } = useTextStream()
    let agState = createAgUiStreamState()

    try {
      await new Promise<void>((resolve, reject) => {
        let settled = false
        const finish = (error?: Error) => {
          if (settled)
            return
          settled = true
          isStreaming.value = false
          isReasoning.value = false
          abortStream.value = undefined
          if (error)
            reject(error)
          else
            resolve()
        }

        const { abort } = createJsonSSE({
          url: createStreamUrl('/agentScopeChat/chat/stream/completion'),
          body: JSON.stringify({
            chatId: chatId.value,
            content: userContent,
          }),
          onEvent(payload) {
            const result = applyAgUiEvent(agState, payload)
            agState = result.state
            applyPartsToMessage(aiMsg, { text: agState.text, reasoning: agState.reasoning })
            isReasoning.value = agState.isReasoning
            currentStreamContent.value = agState.text
            reasoningContent.value = agState.reasoning

            if (result.error) {
              const msg = agState.errorMessage || '对话失败'
              applyPartsToMessage(aiMsg, { text: msg, reasoning: agState.reasoning })
              errorMessageIds.value.add(aiMsg.id)
              abort()
              toast.error(msg)
              finish(new Error(msg))
              return
            }

            if (result.done) {
              abort()
              finish()
            }
          },
          onClose() {
            finish()
          },
          onError(err) {
            const msg = err?.message || '请求失败'
            applyPartsToMessage(aiMsg, { text: aiMsg.content || msg, reasoning: reasoningContent.value })
            toast.error('对话请求失败')
            finish(err instanceof Error ? err : new Error(msg))
          },
        })

        abortStream.value = abort
      })
    }
    catch {
      isStreaming.value = false
      isReasoning.value = false
      if (!aiMsg.content)
        applyPartsToMessage(aiMsg, { text: '请求异常', reasoning: reasoningContent.value })
    }
    finally {
      abortStream.value = undefined
    }
  }

  async function doLoongAiStream(aiMsg: IChatMessage, options?: SendMessageOptions) {
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
            syncLoongAiParts(aiMsg)
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
            applyPartsToMessage(aiMsg, {
              text: err?.data?.content || err?.message || '请求失败',
              reasoning: reasoningContent.value,
            })
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
      if (!aiMsg.content)
        applyPartsToMessage(aiMsg, { text: '请求异常', reasoning: reasoningContent.value })
      toast.error('对话请求异常')
    }
    finally {
      abortStream.value = undefined
    }
  }

  function handleStreamEvent(event: SSEEvent, aiMsg: IChatMessage) {
    const eventName = event.event
    const data = event.data

    if (data.conversationId)
      conversationId.value = data.conversationId

    if (eventName === '[DATA]') {
      isReasoning.value = false
      if (data.content) {
        currentStreamContent.value = mergeStreamText(currentStreamContent.value, data.content, data.fullFlag)
        syncLoongAiParts(aiMsg)
      }
      if (data.id)
        aiMsg.contentId = String(data.id)
      return
    }

    if (eventName === '[DONE]') {
      isStreaming.value = false
      isReasoning.value = false
      const lastAssistantIndex = messages.value.length - 1
      const lastUserIndex = messages.value.length - 2
      if (
        lastUserIndex >= 0
        && messages.value[lastAssistantIndex]?.contentId
        && messages.value[lastUserIndex]?.role === 'user'
      ) {
        messages.value[lastUserIndex].contentId = messages.value[lastAssistantIndex].contentId
      }
      if (!chatId.value && data.content) {
        try {
          const doneData = JSON.parse(data.content)
          if (doneData.chatId)
            chatId.value = String(doneData.chatId)
        }
        catch {
          // ignore
        }
      }
      return
    }

    if (eventName === '[ERROR]' || eventName === '[FAILED]') {
      isStreaming.value = false
      isReasoning.value = false
      applyPartsToMessage(aiMsg, { text: data.content || '请求失败', reasoning: reasoningContent.value })
      errorMessageIds.value.add(aiMsg.id)
      return
    }

    if (eventName === '[PARAGRAPH_END]' || eventName === '[CHAT_MESSAGE]')
      return

    if (eventName === '[REASONING]') {
      isReasoning.value = true
      reasoningContent.value = mergeStreamText(reasoningContent.value, data.reasoningContent, data.fullFlag)
      syncLoongAiParts(aiMsg)
      return
    }

    if (eventName === '[REASONING_END]')
      isReasoning.value = false
  }

  function stopGeneration() {
    abortStream.value?.()
    abortStream.value = undefined
    isStreaming.value = false
    isReasoning.value = false
  }

  return {
    messages,
    chatId,
    conversationId,
    isFirstMessage,
    isStreaming,
    isReasoning,
    currentStreamContent,
    reasoningContent,
    sendMessage,
    stopGeneration,
    seedWelcomeMessage,
  }
}
