import { useAuthStore } from '@/stores/auth'

import { useApiFetch } from './use-fetch'

export function useAuth() {
  const router = useRouter()

  const authStore = useAuthStore()
  const loading = ref(false)
  const { apiFetch } = useApiFetch()

  async function logout() {
    try {
      await apiFetch('/login/logout', { method: 'POST' })
    }
    catch {
      // 后端接口失败也要继续清前端
    }
    finally {
      authStore.clearAuth()
      router.push({ path: '/auth/sign-in' })
    }
  }

  function toHome() {
    router.push({ path: '/dashboard' })
  }

  async function login(phone: string, password: string) {
    loading.value = true
    try {
      const res = await apiFetch('/login/password', {
        method: 'POST',
        body: { phone, password },
      })

      authStore.setToken(res.data.token)
      authStore.setUserInfo(res.data.user)

      const redirect = router.currentRoute.value.query.redirect as string
      if (!redirect || redirect.startsWith('//')) {
        toHome()
      }
      else {
        router.push(redirect)
      }
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    logout,
    login,
  }
}
