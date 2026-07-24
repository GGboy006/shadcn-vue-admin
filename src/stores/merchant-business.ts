import { defineStore } from 'pinia'
import { ref } from 'vue'

import { useUserInfoStore } from '@/stores/user-info'

/**
 * 商户后台代客模式 store
 *
 * 两种身份共用商户后台页面:
 * - 商户/物业自身(userType=4/5):proxyMode=false,merchantId 取自身用户信息
 * - 站长代客(userType=3):proxyMode=true,merchantId/merchantName 由商户列表跳转时带入
 *
 * persist 用 localStorage:同窗口刷新页面需保持代客状态;退出时显式 clear()。
 */
export const useMerchantBusinessStore = defineStore('merchant-business', () => {
  /** 是否站长代客模式 */
  const proxyMode = ref(false)
  /** 当前操作的 merchantId(两种身份统一) */
  const merchantId = ref('')
  /** 当前操作商户名(代客模式顶栏展示,跳转时从商户列表带入) */
  const merchantName = ref('')

  /** 站长代客进入:从商户列表跳转时显式调用 */
  function enterProxy(mId: string, mName: string) {
    proxyMode.value = true
    merchantId.value = mId
    merchantName.value = mName
  }

  /** 退出代客:点返回按钮时调用,菜单自动重载回站长视角 */
  function clear() {
    proxyMode.value = false
    merchantId.value = ''
    merchantName.value = ''
  }

  /** 商户/物业自身:从用户信息取 merchantId(非代客) */
  function initSelf() {
    const userInfoStore = useUserInfoStore()
    proxyMode.value = false
    merchantName.value = '' // 自身模式顶栏不显示商户名
    merchantId.value = userInfoStore.merchantInfo?.merchantId ?? ''
  }

  return {
    proxyMode,
    merchantId,
    merchantName,
    enterProxy,
    clear,
    initSelf,
  }
}, {
  // 复用 plugins/pinia/setup.ts 中 createPersistedState 的全局 storage(localStorage),
  // 不在此直接引用 localStorage,保持 SSR/测试友好(与 auth.ts / user-info.ts 一致)。
  persist: {
    pick: ['proxyMode', 'merchantId', 'merchantName'],
  },
})
