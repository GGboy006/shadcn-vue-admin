import type { IChatMessage, IMessagePart, IToolCall } from '@/services/api/conversation.api'

const VISIBLE_ROLES = new Set(['user', 'assistant', 'station_master', 'station_merchant'])

/** 独立的 tool_call / tool_result 消息会和 assistant.parts 重复，列表里不单独渲染 */
export function isVisibleChatRole(role: string | undefined): boolean {
  return VISIBLE_ROLES.has(role ?? '')
}

export function visibleChatMessages(messages: IChatMessage[]): IChatMessage[] {
  return messages.filter(msg => isVisibleChatRole(msg.role))
}

/** 取出指定 type 的 parts 文本，按出现顺序拼接 */
export function getMessagePartText(msg: IChatMessage, type: IMessagePart['type']): string {
  return (msg.parts ?? [])
    .filter(part => part.type === type)
    .map(part => part.content)
    .filter((content): content is string => !!content)
    .join('\n')
}

export function getMessageText(msg: IChatMessage): string {
  return getMessagePartText(msg, 'text') || msg.finalContent || msg.content || ''
}

export function getMessageReasoning(msg: IChatMessage): string {
  return getMessagePartText(msg, 'reasoning')
    || msg.reasoningSegments?.map(s => s.content).filter(Boolean).join('\n')
    || ''
}

export function getMessageToolCalls(msg: IChatMessage): IMessagePart[] {
  return (msg.parts ?? []).filter(part => part.type === 'tool_call' && part.toolCall)
}

export function hasAssistantVisualContent(msg: IChatMessage): boolean {
  return Boolean(
    getMessageText(msg)
    || getMessageReasoning(msg)
    || getMessageToolCalls(msg).length,
  )
}

export function formatDurationMs(duration?: string | number | null): string {
  const ms = Number(duration)
  if (!Number.isFinite(ms) || ms <= 0)
    return ''
  if (ms < 1000)
    return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(1)}秒`
}

export function isRedactedPayload(value?: string | null): boolean {
  if (!value)
    return false
  return value.includes('sensitive_tool_payload') || /"redacted"\s*:\s*true/.test(value)
}

export function formatToolPreview(value?: string | null, maxLen = 400): string {
  if (!value)
    return ''
  if (isRedactedPayload(value))
    return '敏感内容已隐藏'
  let text = value
  try {
    const parsed = JSON.parse(value)
    if (typeof parsed === 'string') {
      try {
        text = JSON.stringify(JSON.parse(parsed), null, 2)
      }
      catch {
        text = parsed
      }
    }
    else {
      text = JSON.stringify(parsed, null, 2)
    }
  }
  catch {
    // 保持原样
  }
  if (text.length > maxLen)
    return `${text.slice(0, maxLen)}…`
  return text
}

export function getToolCallLabel(toolCall?: IToolCall | null): string {
  return toolCall?.display || toolCall?.toolName || '工具调用'
}

/** AI Elements Message 的 from：客户端当 user，其余当 assistant */
export function toMessageUiFrom(role: string | undefined): 'user' | 'assistant' {
  return role === 'user' || role === 'station_merchant' ? 'user' : 'assistant'
}

/** 站长工作台 userPosition=left 时客户端在左；数字员工/技能页等同 right */
export function toMessageAlign(
  role: string | undefined,
  userPosition: 'left' | 'right' = 'right',
): 'start' | 'end' {
  const isClient = role === 'user' || role === 'station_merchant'
  if (userPosition === 'left')
    return isClient ? 'start' : 'end'
  return isClient ? 'end' : 'start'
}

export type AiToolState
  = | 'input-streaming'
    | 'input-available'
    | 'approval-requested'
    | 'approval-responded'
    | 'output-available'
    | 'output-error'
    | 'output-denied'

export interface AiToolView {
  toolName: string
  title: string
  state: AiToolState
  input?: unknown
  output?: unknown
  errorText?: string
}

export function toAiToolState(toolCall?: IToolCall | null, isStreaming = false): AiToolState {
  if (toolCall?.error)
    return 'output-error'
  const status = (toolCall?.status ?? '').toLowerCase()
  if (status === 'error' || status === 'failed')
    return 'output-error'
  if (status === 'completed' || status === 'success' || toolCall?.result)
    return 'output-available'
  if (isStreaming || status === 'running' || status === 'pending')
    return 'input-available'
  return 'input-streaming'
}

/** 给 AI Elements ToolInput/ToolOutput 用：脱敏、解 JSON、截断 */
export function parseToolPayload(value?: string | null, maxLen = 800): unknown {
  if (!value)
    return undefined
  if (isRedactedPayload(value))
    return { redacted: true, message: '敏感内容已隐藏' }

  let parsed: unknown = value
  try {
    parsed = JSON.parse(value)
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed)
      }
      catch {
        // 保持内层字符串
      }
    }
  }
  catch {
    parsed = value
  }

  const text = typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2)
  if (text.length > maxLen)
    return `${text.slice(0, maxLen)}…`
  return parsed
}

export function toAiToolView(part: IMessagePart, isStreaming = false): AiToolView | null {
  if (part.type !== 'tool_call' && !part.toolCall)
    return null
  const toolCall = part.toolCall
  const toolName = getToolCallLabel(toolCall)
  const durationText = formatDurationMs(toolCall?.duration ?? part.duration)
  return {
    toolName,
    title: durationText ? `${toolName} · ${durationText}` : toolName,
    state: toAiToolState(toolCall, isStreaming),
    input: parseToolPayload(toolCall?.arguments),
    output: parseToolPayload(toolCall?.result),
    errorText: toolCall?.error ?? undefined,
  }
}

export function durationSeconds(duration?: string | number | null): number | undefined {
  const ms = Number(duration)
  if (!Number.isFinite(ms) || ms <= 0)
    return undefined
  return Math.max(1, Math.round(ms / 1000))
}

/**
 * 把流式累积结果写回气泡：parts 优先，content 同步给旧渲染路径兜底。
 */
export function applyPartsToMessage(
  msg: IChatMessage,
  input: { text?: string, reasoning?: string },
) {
  const text = input.text ?? ''
  const reasoning = input.reasoning ?? ''
  const parts: IMessagePart[] = []
  if (reasoning)
    parts.push({ type: 'reasoning', content: reasoning })
  if (text)
    parts.push({ type: 'text', content: text })

  msg.parts = parts
  msg.content = text
  msg.finalContent = text
  msg.reasoningSegments = reasoning
    ? [{ messageId: msg.id, content: reasoning }]
    : []
}

/** 历史消息没有 parts 时，用 content / reasoningSegments 补齐 */
export function hydrateChatMessage(msg: IChatMessage): IChatMessage {
  const hydrated: IChatMessage = {
    ...msg,
    id: String(msg.id ?? ''),
    chatId: msg.chatId != null ? String(msg.chatId) : '',
    imageGenerationId: msg.imageGenerationId != null ? String(msg.imageGenerationId) : '',
    parts: msg.parts ?? [],
    attachments: msg.attachments ?? [],
    reasoningSegments: msg.reasoningSegments ?? [],
    content: msg.content ?? '',
    finalContent: msg.finalContent ?? msg.content ?? '',
  }

  if (hydrated.parts.length > 0)
    return hydrated

  applyPartsToMessage(hydrated, {
    text: hydrated.finalContent || hydrated.content,
    reasoning: getMessageReasoning(hydrated),
  })
  return hydrated
}
