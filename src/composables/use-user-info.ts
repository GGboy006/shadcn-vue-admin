import { isMerchantBusinessUser } from '@/constants/user-type'
import { useAuthStore } from '@/stores/auth'
import { useUserInfoStore } from '@/stores/user-info'

import { useApiFetch } from './use-fetch'

export function useUserInfo() {
  const { apiFetch } = useApiFetch()
  const authStore = useAuthStore()
  const userInfoStore = useUserInfoStore()

  async function fetchUserInfo() {
    const userType = authStore.userInfo?.userType
    if (!userType)
      return

    if (userType === 3) {
      const res = await apiFetch('/station/myStationInfo')
      userInfoStore.setStationInfo(res.data)
    }
    else if (isMerchantBusinessUser(userType)) {
      const res = await apiFetch('/merchant/myMerchantInfo')
      userInfoStore.setMerchantInfo(res.data)
    }
  }

  async function updateStationInfo(data: {
    stationId: number
    stationName?: string
    serviceScope?: string
    address?: string
    contactPhone?: string
    remark?: string
    status?: number
  }) {
    await apiFetch('/station/updateStationInfo', {
      method: 'PUT',
      body: data,
    })
  }

  return {
    fetchUserInfo,
    updateStationInfo,
  }
}
