import { isMerchantBusinessUser, UserType } from '@/constants/user-type'
import { useAuthStore } from '@/stores/auth'
import { useUserInfoStore } from '@/stores/user-info'

import { useApiFetch } from './use-fetch'

export function useAuth() {
  const router = useRouter()

  const authStore = useAuthStore()
  const userInfoStore = useUserInfoStore()
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
      userInfoStore.clearUserInfo()
      router.push({ path: '/auth/sign-in' })
    }
  }

  function toHome() {
    // 居委会后台首页是 /neighborhood/home,其余身份回 /dashboard
    if (authStore.userInfo?.userType === UserType.committee) {
      router.push({ path: '/neighborhood/home' })
      return
    }
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

      // 根据用户类型获取详细信息
      const userType = res.data.user?.userType
      if (userType === 3) {
        const stationRes = await apiFetch('/station/myStationInfo')
        userInfoStore.setStationInfo(stationRes.data)
      }
      else if (isMerchantBusinessUser(userType)) {
        const merchantRes = await apiFetch('/merchant/myMerchantInfo')
        userInfoStore.setMerchantInfo(merchantRes.data)
      }

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
