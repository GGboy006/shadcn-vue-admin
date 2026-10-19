import { defineStore } from 'pinia'

import { clearHousekeeperKind } from '@/services/api/housekeeper-partner.access'
import { lazyAuthStorage } from '@/utils/proxy-auth'

export interface LoginUserVO {
  nickname: string
  avatar: string
  gender: number
  phone: string
  userType: number
}

export const useAuthStore = defineStore('user', () => {
  const isLogin = ref(false)
  const token = ref('')
  const userInfo = ref<LoginUserVO | null>(null)

  function setToken(value: string) {
    token.value = value
    isLogin.value = !!value
  }

  function setUserInfo(value: LoginUserVO) {
    userInfo.value = value
  }

  function clearAuth() {
    token.value = ''
    userInfo.value = null
    isLogin.value = false
    clearHousekeeperKind()
  }

  function getUserType(): number | undefined {
    return userInfo.value?.userType
  }

  return {
    isLogin,
    token,
    userInfo,
    setToken,
    setUserInfo,
    clearAuth,
    getUserType,
  }
}, {
  persist: {
    // 代客标签页(新窗口换商户 token)用 sessionStorage 与站长 localStorage 隔离;
    // 其余标签页用 localStorage。lazyAuthStorage 懒求值,避免模块加载即访问 DOM。
    storage: lazyAuthStorage,
  },
})
