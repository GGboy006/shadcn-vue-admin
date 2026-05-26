import { defineStore } from 'pinia'

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
  }

  return {
    isLogin,
    token,
    userInfo,
    setToken,
    setUserInfo,
    clearAuth,
  }
}, {
  persist: true,
})
