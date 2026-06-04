/**
 * ofetch: https://github.com/unjs/ofetch
 */
import { ofetch } from 'ofetch'
import { toast } from 'vue-sonner'

import { ApiStatus } from '@/constants/api-status'
import { API_BASE_URL, API_TIMEOUT } from '@/constants/app-config'
import pinia from '@/plugins/pinia/setup'
import { useAuthStore } from '@/stores/auth'

const apiFetch = ofetch.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT ?? false,
  onRequest({ options }) {
    const authStore = useAuthStore(pinia)
    if (authStore.token) {
      const headers = new Headers(options.headers)
      headers.set('Authorization', `Bearer ${authStore.token}`)
      options.headers = headers
    }
  },
  onRequestError(_error) {},
  onResponse({ response }) {
    const body = response._data
    if (body && body.code !== undefined && body.code !== 0) {
      // 未登录或 token 过期，清除状态并跳转
      if (body.code === ApiStatus.unauthorized) {
        const authStore = useAuthStore(pinia)
        authStore.clearAuth()
        toast.error('登录已过期，请重新登录')
        window.location.href = '/auth/sign-in'
        throw new Error('登录已过期')
      }
      toast.error(body.msg || '请求失败')
      throw new Error(body.msg || '请求失败')
    }
  },
  onResponseError({ response }) {
    if (response.status === 401) {
      const authStore = useAuthStore(pinia)
      authStore.clearAuth()
      window.location.href = '/auth/sign-in'
    }
  },
})

/** SSE 流式请求：复用 baseURL 和 token 认证 */
async function apiFetchStream(
  url: string,
  options: {
    method?: 'GET' | 'POST'
    body?: string
    headers?: Record<string, string>
    onMessage: (chunk: string) => void
    onComplete: () => void
    onError: (error: Error) => void
  },
) {
  try {
    // 获取认证 token
    const authStore = useAuthStore(pinia)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    }
    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: options.method || 'POST',
      headers,
      body: options.body,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('Response body is null')
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        options.onComplete()
        break
      }

      const chunk = decoder.decode(value, { stream: true })
      // 解析 SSE 格式: data: {...}
      const lines = chunk.split('\n')
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6).trim()
          if (dataStr && dataStr !== '[DONE]') {
            try {
              const parsed = JSON.parse(dataStr)
              // 根据实际 SSE 格式提取内容
              const content = parsed.content || parsed.choices?.[0]?.delta?.content || parsed.text || ''
              if (content) {
                options.onMessage(content)
              }
            }
            catch {
              // 非 JSON 数据，直接作为文本
              options.onMessage(dataStr)
            }
          }
        }
      }
    }

    reader.releaseLock()
  }
  catch (error) {
    options.onError(error instanceof Error ? error : new Error(String(error)))
  }
}

export function useApiFetch() {
  return {
    apiFetch,
    apiFetchStream,
  }
}
