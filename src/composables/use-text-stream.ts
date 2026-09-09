/**
 * 基于 @microsoft/fetch-event-source 的 SSE 流式请求封装
 * 参考 useStream.js 实现
 */
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { toast } from 'vue-sonner'

import { API_BASE_URL } from '@/constants/app-config'
import pinia from '@/plugins/pinia/setup'
import { useAuthStore } from '@/stores/auth'

/** SSE 事件对象 */
export interface TextStreamEvent {
  event: string
  id?: string
  data: Record<string, any>
}

interface StreamConnectionOptions {
  url: string
  body: string
  headers?: Record<string, string>
  /** 超时时间（毫秒），默认 30000 */
  timeout?: number
  /** 最大重试次数，默认 5 */
  maxRetries?: number
  onOpen?: (res: Response) => void
  onError?: (error: any) => void
  onClose?: () => void
}

/** 创建 SSE 连接的配置 */
export interface TextStreamOptions extends StreamConnectionOptions {
  /** 正常消息 / 聊天消息 */
  onMessage?: (event: TextStreamEvent) => void
  /** 工具调用响应 */
  onTools?: (event: TextStreamEvent) => void
  /** 推理中 */
  onReasoning?: (event: TextStreamEvent) => void
  /** 推理结束 */
  onReasoningEnd?: (event: TextStreamEvent) => void
  /** 流结束 */
  onDone?: (event: TextStreamEvent) => void
}

/** AgentScope AG-UI：data 本身就是事件 JSON，不再套 LoongAI 的 event 信封 */
export interface JsonStreamOptions extends StreamConnectionOptions {
  onEvent?: (payload: Record<string, any>) => void
}

/**
 * 文本流式请求
 */
function openSseConnection(
  options: StreamConnectionOptions,
  onmessage: (ev: { data: string, event?: string }) => void,
) {
  const authStore = useAuthStore(pinia)
  const ctrl = new AbortController()
  const timeout = options.timeout ?? 30000
  const maxRetries = options.maxRetries ?? 5
  let errorRetry = 0

  const timer = setTimeout(() => {
    ctrl.abort()
    options.onError?.(new Error('请求超时'))
    toast.error('请求超时')
  }, timeout)

  fetchEventSource(options.url, {
    method: 'POST',
    body: options.body,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authStore.token ? `Bearer ${authStore.token}` : '',
      ...options.headers,
    },
    signal: ctrl.signal,
    openWhenHidden: true,
    async onopen(res) {
      clearTimeout(timer)
      if (res.status >= 400) {
        throw new Error(`HTTP ${res.status}`)
      }
      errorRetry = 0
      options.onOpen?.(res)
    },
    onmessage,
    onerror(err) {
      clearTimeout(timer)
      if (++errorRetry >= maxRetries) {
        ctrl.abort()
        options.onError?.(err)
        throw err
      }
    },
    onclose() {
      clearTimeout(timer)
      options.onClose?.()
    },
  }).catch((err) => {
    clearTimeout(timer)
    options.onError?.(err)
    console.error('[useTextStream] 请求异常:', err)
  })

  function abort() {
    clearTimeout(timer)
    ctrl.abort()
  }

  return { abort, ctrl }
}

export function useTextStream() {
  /**
   * LoongAI 信封：{"event":"[DATA]","data":{...}}
   */
  function createTextSSE(options: TextStreamOptions) {
    const { abort, ctrl } = openSseConnection(options, (ev) => {
      try {
        const parsed = JSON.parse(ev.data)
        const event: TextStreamEvent = {
          event: parsed.event,
          id: parsed.id,
          data: parsed.data || {},
        }

        switch (event.event) {
          case '[DATA]':
          case '[CHAT_MESSAGE]':
            options.onMessage?.(event)
            break
          case '[TOOL_RESPONSE]':
            options.onTools?.(event)
            break
          case '[REASONING]':
            options.onReasoning?.(event)
            break
          case '[REASONING_END]':
            options.onReasoningEnd?.(event)
            break
          case '[DONE]':
            options.onDone?.(event)
            ctrl.abort()
            break
          case '[ERROR]':
          case '[FAILED]':
            options.onError?.(event)
            ctrl.abort()
            break
        }
      }
      catch (err) {
        console.error('[useTextStream] 解析消息失败:', err, ev.data)
      }
    })

    return { abort }
  }

  /**
   * AG-UI：data 即事件本体。结束由业务层在 RUN_FINISHED / RUN_ERROR 后 abort。
   */
  function createJsonSSE(options: JsonStreamOptions) {
    const { abort } = openSseConnection(options, (ev) => {
      if (!ev.data || ev.data === '[DONE]')
        return
      try {
        const parsed = JSON.parse(ev.data)
        if (parsed && typeof parsed === 'object') {
          if (!parsed.type && ev.event)
            parsed.type = ev.event
          options.onEvent?.(parsed)
        }
      }
      catch (err) {
        console.error('[useTextStream] 解析 AG-UI 消息失败:', err, ev.data)
      }
    })

    return { abort }
  }

  return {
    createTextSSE,
    createJsonSSE,
  }
}

/**
 * 创建完整 URL（带 baseURL）
 */
export function createStreamUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}
