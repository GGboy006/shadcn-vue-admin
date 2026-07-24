import type { RouteLocationNormalized } from 'vue-router'

import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { resolveMerchantBusinessRoute } from '@/router/guard/merchant-business-guard'
import { useAuthStore } from '@/stores/auth'
import { useMerchantBusinessStore } from '@/stores/merchant-business'
import { useUserInfoStore } from '@/stores/user-info'

function makeRoute(path: string, query: Record<string, string> = {}): RouteLocationNormalized {
  return { path, query } as unknown as RouteLocationNormalized
}

describe('resolveMerchantBusinessRoute', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('站长(userType=3)进入商户后台', () => {
    it('should enterProxy and pass when mId present in query', () => {
      const authStore = useAuthStore()
      authStore.setToken('station-token')
      authStore.setUserInfo({ userType: 3 } as any)

      const store = useMerchantBusinessStore()
      const result = resolveMerchantBusinessRoute(makeRoute('/merchant-business', { mId: 'M1001', mName: '星巴克' }))

      expect(result).toBeUndefined()
      expect(store.proxyMode).toBe(true)
      expect(store.merchantId).toBe('M1001')
      expect(store.merchantName).toBe('星巴克')
    })

    it('should pass without change when already in proxy mode', () => {
      const authStore = useAuthStore()
      authStore.setToken('station-token')
      authStore.setUserInfo({ userType: 3 } as any)

      const store = useMerchantBusinessStore()
      store.enterProxy('M1001', '星巴克')

      const result = resolveMerchantBusinessRoute(makeRoute('/merchant-business/category'))

      expect(result).toBeUndefined()
      expect(store.merchantId).toBe('M1001') // 未被覆盖
    })

    it('should redirect to /merchants when no mId and not in proxy mode', () => {
      const authStore = useAuthStore()
      authStore.setToken('station-token')
      authStore.setUserInfo({ userType: 3 } as any)

      const result = resolveMerchantBusinessRoute(makeRoute('/merchant-business'))

      expect(result).toBe('/merchants')
    })
  })

  describe('商户/物业(userType=4/5)进入商户后台', () => {
    it('should initSelf and pass when merchantId available', () => {
      const authStore = useAuthStore()
      authStore.setToken('merchant-token')
      authStore.setUserInfo({ userType: 4 } as any)
      const userInfoStore = useUserInfoStore()
      userInfoStore.setMerchantInfo({ merchantId: 'M_SELF' } as any)

      const store = useMerchantBusinessStore()
      const result = resolveMerchantBusinessRoute(makeRoute('/merchant-business/profile'))

      expect(result).toBeUndefined()
      expect(store.proxyMode).toBe(false)
      expect(store.merchantId).toBe('M_SELF')
    })

    it('should redirect to 403 when merchantId missing', () => {
      const authStore = useAuthStore()
      authStore.setToken('merchant-token')
      authStore.setUserInfo({ userType: 4 } as any)
      // 不设置 merchantInfo

      const result = resolveMerchantBusinessRoute(makeRoute('/merchant-business/profile'))

      expect(result).toBe('/errors/403')
    })

    it('should also work for property (userType=5)', () => {
      const authStore = useAuthStore()
      authStore.setToken('prop-token')
      authStore.setUserInfo({ userType: 5 } as any)
      const userInfoStore = useUserInfoStore()
      userInfoStore.setMerchantInfo({ merchantId: 'P_SELF' } as any)

      const store = useMerchantBusinessStore()
      const result = resolveMerchantBusinessRoute(makeRoute('/merchant-business/goods'))

      expect(result).toBeUndefined()
      expect(store.merchantId).toBe('P_SELF')
      expect(store.proxyMode).toBe(false)
    })
  })

  describe('离开商户后台(非 /merchant-business 路由)', () => {
    it('should auto clear proxy mode when leaving to another route', () => {
      const authStore = useAuthStore()
      authStore.setToken('station-token')
      authStore.setUserInfo({ userType: 3 } as any)
      const store = useMerchantBusinessStore()
      store.enterProxy('M1001', '星巴克')

      const result = resolveMerchantBusinessRoute(makeRoute('/merchants'))

      expect(result).toBeUndefined()
      expect(store.proxyMode).toBe(false)
      expect(store.merchantId).toBe('')
    })

    it('should do nothing when not in proxy mode', () => {
      const authStore = useAuthStore()
      authStore.setToken('station-token')
      authStore.setUserInfo({ userType: 3 } as any)

      const store = useMerchantBusinessStore()
      const result = resolveMerchantBusinessRoute(makeRoute('/dashboard'))

      expect(result).toBeUndefined()
      expect(store.proxyMode).toBe(false)
    })
  })

  describe('未登录或身份未知', () => {
    it('should no-op when not logged in (leave to auth guard)', () => {
      // 不 setToken
      const result = resolveMerchantBusinessRoute(makeRoute('/merchant/business'))

      expect(result).toBeUndefined()
    })
  })
})
