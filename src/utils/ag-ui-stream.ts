/**
 * AgentScope AG-UI SSE 事件归一化。
 *
 * 后端 `POST /agentScopeChat/chat/stream/completion` 每条 data: 后跟 JSON，
 * `type` 为 TEXT_MESSAGE_* / REASONING_MESSAGE_* / RUN_* / CUSTOM。
 * 字段名在网关里可能是 camelCase 或嵌在 data 里，这里统一抽出来。
 */

import type { ImageGenerationCard } from '@/utils/image-generation-card'

import { parseImageGenerationArtifact } from '@/utils/image-generation-card'

export interface AgUiToolCall {
  toolCallId: string
  toolName: string
  display: string
  arguments: string
  result: string
  status: 'running' | 'completed' | 'failed'
}

export interface AgUiStreamState {
  text: string
  reasoning: string
  isReasoning: boolean
  title?: string
  chatId?: string
  errorMessage?: string
  imageCards: ImageGenerationCard[]
  toolCalls: AgUiToolCall[]
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
    imageCards: [],
    toolCalls: [],
  }
}

const REDACTED_TOOL_PAYLOAD = '{"redacted":true,"reason":"sensitive_tool_payload"}'

function completeRunningTools(calls: AgUiToolCall[]): AgUiToolCall[] {
  if (!calls.some(call => call.status === 'running'))
    return calls
  return calls.map(call => call.status === 'running' ? { ...call, status: 'completed' } : call)
}

function readToolId(payload: Record<string, unknown>): string {
  const nested = isRecord(payload.data) ? payload.data : undefined
  return readString(payload.toolCallId, payload.tool_call_id, nested?.toolCallId, nested?.tool_call_id) ?? ''
}

function upsertToolCall(calls: AgUiToolCall[], incoming: AgUiToolCall): AgUiToolCall[] {
  const index = calls.findIndex(item => item.toolCallId === incoming.toolCallId)
  if (index < 0)
    return [...calls, incoming]
  const next = [...calls]
  next[index] = incoming
  return next
}

/** 流式工具步骤：用 toolDisplayName 展示，脱敏参数不拼进正文 */
function applyToolCall(
  state: AgUiStreamState,
  payload: Record<string, unknown>,
  phase: 'start' | 'args' | 'end' | 'result',
): AgUiStreamState {
  const toolCallId = readToolId(payload)
  if (!toolCallId)
    return { ...state, isReasoning: false }

  const nested = isRecord(payload.data) ? payload.data : undefined
  const current = state.toolCalls.find(item => item.toolCallId === toolCallId)
  const toolName = readString(
    payload.toolCallName,
    payload.tool_call_name,
    nested?.toolCallName,
    current?.toolName,
  ) ?? ''
  const display = readString(
    payload.toolDisplayName,
    payload.tool_display_name,
    nested?.toolDisplayName,
    current?.display,
    toolName,
  ) || '工具调用'
  const redacted = payload.redacted === true
    || nested?.redacted === true
    || current?.arguments === REDACTED_TOOL_PAYLOAD
  const delta = getAgUiDelta(payload)

  let args = current?.arguments ?? ''
  let result = current?.result ?? ''
  let status = current?.status ?? 'running'

  if (phase === 'args') {
    status = 'running'
    if (redacted)
      args = REDACTED_TOOL_PAYLOAD
    else if (delta)
      args += delta
  }
  if (phase === 'result') {
    const rawResult = readString(payload.content, payload.result, nested?.content, nested?.result, delta)
    result = redacted ? REDACTED_TOOL_PAYLOAD : (rawResult || result)
    status = payload.error || nested?.error ? 'failed' : 'completed'
  }

  return {
    ...state,
    isReasoning: false,
    toolCalls: upsertToolCall(state.toolCalls, {
      toolCallId,
      toolName: toolName || '工具调用',
      display,
      arguments: args,
      result,
      status,
    }),
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
      next.toolCalls = completeRunningTools(state.toolCalls)
      return { state: next, done: false, error: false }

    case 'TEXT_MESSAGE_CONTENT':
      next.isReasoning = false
      next.toolCalls = completeRunningTools(state.toolCalls)
      if (delta)
        next.text += delta
      return { state: next, done: false, error: false }

    case 'TEXT_MESSAGE_END':
      next.isReasoning = false
      return { state: next, done: false, error: false }

    case 'CUSTOM': {
      const customName = getCustomName(payload)
      const value = getCustomValue(payload)
      if (customName === 'conversation_title') {
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
      if (customName === 'artifact') {
        const card = parseImageGenerationArtifact(value)
        if (card) {
          const rest = state.imageCards.filter(item => item.imageGenerationId !== card.imageGenerationId)
          next.imageCards = [...rest, card]
        }
      }
      return { state: next, done: false, error: false }
    }

    case 'TOOL_CALL_START':
      return { state: applyToolCall(state, payload, 'start'), done: false, error: false }

    case 'TOOL_CALL_ARGS':
    case 'TOOL_CALL_CHUNK':
      return { state: applyToolCall(state, payload, 'args'), done: false, error: false }

    case 'TOOL_CALL_END':
      return { state: applyToolCall(state, payload, 'end'), done: false, error: false }

    case 'TOOL_CALL_RESULT':
    case 'TOOL_RESULT':
      return { state: applyToolCall(state, payload, 'result'), done: false, error: false }

    case 'RUN_FINISHED':
      next.isReasoning = false
      next.toolCalls = completeRunningTools(state.toolCalls)
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
