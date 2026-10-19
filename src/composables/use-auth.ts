import { toast } from 'vue-sonner'

import { homePathForUser, isHousekeeperUser, isMerchantBusinessUser, isPropertyUser, PROPERTY_ACCESS_DENIED, UserType } from '@/constants/user-type'
import { ensureHousekeeperKind, housekeeperKind } from '@/services/api/housekeeper-partner.access'
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

  async function toHome() {
    const userType = authStore.userInfo?.userType
    if (isHousekeeperUser(userType))
      await ensureHousekeeperKind(authStore.token)
    if (userType === UserType.committee || isHousekeeperUser(userType)) {
      router.push({ path: homePathForUser(userType, housekeeperKind().value) })
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

      const userType = res.data.user?.userType
      if (isPropertyUser(userType)) {
        toast.error(PROPERTY_ACCESS_DENIED)
        return
      }

      authStore.setToken(res.data.token)
      authStore.setUserInfo(res.data.user)

      // 根据用户类型获取详细信息
      if (userType === 3) {
        const stationRes = await apiFetch('/station/myStationInfo')
        userInfoStore.setStationInfo(stationRes.data)
      }
      else if (isMerchantBusinessUser(userType)) {
        const merchantRes = await apiFetch('/merchant/myMerchantInfo')
        userInfoStore.setMerchantInfo(merchantRes.data)
      }

      const redirect = router.currentRoute.value.query.redirect as string
      const redirectIsSafe = !!redirect && !redirect.startsWith('//')
      const housekeeperLeavesOwnArea = isHousekeeperUser(userType) && !redirect?.startsWith('/housekeeper')
      if (!redirectIsSafe || housekeeperLeavesOwnArea) {
        await toHome()
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
