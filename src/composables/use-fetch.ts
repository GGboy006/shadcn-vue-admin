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
        return
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

export function useApiFetch() {
  return {
    apiFetch,
  }
}
