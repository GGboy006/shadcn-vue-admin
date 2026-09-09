/**
 * AgentScope AG-UI SSE 事件归一化。
 *
 * 后端 `POST /agentScopeChat/chat/stream/completion` 每条 data: 后跟 JSON，
 * `type` 为 TEXT_MESSAGE_* / REASONING_MESSAGE_* / RUN_* / CUSTOM。
 * 字段名在网关里可能是 camelCase 或嵌在 data 里，这里统一抽出来。
 */

export interface AgUiStreamState {
  text: string
  reasoning: string
  isReasoning: boolean
  title?: string
  chatId?: string
  errorMessage?: string
}

export interface AgUiApplyResult {
  state: AgUiStreamState
  /** RUN_FINISHED：本轮结束，调用方应 abort SSE */
  done: boolean
  /** RUN_ERROR：调用方应 abort 并展示错误 */
  error: boolean
}

export function createAgUiStreamState(): AgUiStreamState {
  return {
    text: '',
    reasoning: '',
    isReasoning: false,
  }
}

/** 从未知 SSE JSON 里取出事件名，兼容 type / event、大小写与下划线 */
export function getAgUiEventType(raw: Record<string, unknown>): string {
  const nested = isRecord(raw.data) ? raw.data : undefined
  const value = raw.type ?? raw.event ?? nested?.type ?? nested?.event ?? ''
  return String(value).trim().toUpperCase().replace(/-/g, '_')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.length > 0)
      return value
  }
  return undefined
}

/** 流式分片：优先 delta（AG-UI 规范），其次 content / text */
export function getAgUiDelta(raw: Record<string, unknown>): string {
  const nested = isRecord(raw.data) ? raw.data : undefined
  return readString(
    raw.delta,
    raw.content,
    raw.text,
    nested?.delta,
    nested?.content,
    nested?.text,
  ) ?? ''
}

function getCustomName(raw: Record<string, unknown>): string {
  const nested = isRecord(raw.data) ? raw.data : undefined
  return String(raw.name ?? nested?.name ?? '').trim().toLowerCase()
}

function getCustomValue(raw: Record<string, unknown>): unknown {
  const nested = isRecord(raw.data) ? raw.data : undefined
  return raw.value ?? nested?.value ?? raw.data
}

/**
 * 把一条 AG-UI 事件应用到累积状态。
 * 同一轮对话的多段 TEXT_MESSAGE 拼进同一个 assistant 气泡。
 */
export function applyAgUiEvent(state: AgUiStreamState, payload: unknown): AgUiApplyResult {
  if (!isRecord(payload))
    return { state, done: false, error: false }

  const type = getAgUiEventType(payload)
  const next: AgUiStreamState = { ...state }
  const delta = getAgUiDelta(payload)

  switch (type) {
    case 'REASONING_MESSAGE_START':
    case 'REASONING_START':
    case 'THINKING_TEXT_MESSAGE_START':
    case 'THINKING_START':
      next.isReasoning = true
      return { state: next, done: false, error: false }

    case 'REASONING_MESSAGE_CONTENT':
    case 'REASONING_CONTENT':
    case 'THINKING_TEXT_MESSAGE_CONTENT':
      next.isReasoning = true
      if (delta)
        next.reasoning += delta
      return { state: next, done: false, error: false }

    case 'REASONING_MESSAGE_END':
    case 'REASONING_END':
    case 'THINKING_TEXT_MESSAGE_END':
    case 'THINKING_END':
      next.isReasoning = false
      return { state: next, done: false, error: false }

    case 'TEXT_MESSAGE_START':
      next.isReasoning = false
      return { state: next, done: false, error: false }

    case 'TEXT_MESSAGE_CONTENT':
      next.isReasoning = false
      if (delta)
        next.text += delta
      return { state: next, done: false, error: false }

    case 'TEXT_MESSAGE_END':
      next.isReasoning = false
      return { state: next, done: false, error: false }

    case 'CUSTOM': {
      if (getCustomName(payload) === 'conversation_title') {
        const value = getCustomValue(payload)
        if (isRecord(value)) {
          const title = readString(value.title)
          const chatId = value.chatId ?? value.chat_id
          if (title)
            next.title = title
          if (chatId != null)
            next.chatId = String(chatId)
        }
        else if (typeof value === 'string') {
          next.title = value
        }
      }
      return { state: next, done: false, error: false }
    }

    case 'RUN_FINISHED':
      next.isReasoning = false
      return { state: next, done: true, error: false }

    case 'RUN_ERROR': {
      const nested = isRecord(payload.data) ? payload.data : undefined
      next.isReasoning = false
      next.errorMessage = readString(
        payload.message,
        nested?.message,
        payload.content,
      ) ?? '对话失败'
      return { state: next, done: true, error: true }
    }

    default:
      return { state: next, done: false, error: false }
  }
}
