import type { RouteLocationNormalized } from 'vue-router'

import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { resolveMerchantBusinessRoute } from '@/router/guard/merchant-business-guard'
import { useAuthStore } from '@/stores/auth'
import { useUserInfoStore } from '@/stores/user-info'

function makeRoute(path: string, query: Record<string, string> = {}): RouteLocationNormalized {
  return { path, query } as unknown as RouteLocationNormalized
}

describe('resolveMerchantBusinessRoute', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('商户/物业(userType=4/5)进入商户后台', () => {
    it('有 merchantId -> 放行', () => {
      const authStore = useAuthStore()
      authStore.setToken('merchant-token')
      authStore.setUserInfo({ userType: 4 } as any)
      useUserInfoStore().setMerchantInfo({ merchantId: 'M_SELF' } as any)

      const result = resolveMerchantBusinessRoute(makeRoute('/merchant-business/profile'))
      expect(result).toBeUndefined()
    })

    it('无 merchantId -> /errors/403', () => {
      const authStore = useAuthStore()
      authStore.setToken('merchant-token')
      authStore.setUserInfo({ userType: 4 } as any)
      // 不设置 merchantInfo

      const result = resolveMerchantBusinessRoute(makeRoute('/merchant-business/profile'))
      expect(result).toBe('/errors/403')
    })

    it('物业(userType=5)同样放行', () => {
      const authStore = useAuthStore()
      authStore.setToken('prop-token')
      authStore.setUserInfo({ userType: 5 } as any)
      useUserInfoStore().setMerchantInfo({ merchantId: 'P_SELF' } as any)

      const result = resolveMerchantBusinessRoute(makeRoute('/merchant-business/goods'))
      expect(result).toBeUndefined()
    })

    it('代客标签页(userType=4,merchantInfo 由换 token 写入)同样放行', () => {
      const authStore = useAuthStore()
      authStore.setToken('proxy-merchant-token')
      authStore.setUserInfo({ userType: 4 } as any)
      useUserInfoStore().setMerchantInfo({ merchantId: 'M_PROXY' } as any)

      const result = resolveMerchantBusinessRoute(makeRoute('/merchant-business/overview'))
      expect(result).toBeUndefined()
    })

    it('居委会(userType=6)有 merchantId 放行', () => {
      const authStore = useAuthStore()
      authStore.setToken('committee-token')
      authStore.setUserInfo({ userType: 6 } as any)
      useUserInfoStore().setMerchantInfo({ merchantId: 'C_SELF' } as any)

      const result = resolveMerchantBusinessRoute(makeRoute('/merchant-business/goods'))
      expect(result).toBeUndefined()
    })
  })

  describe('站长(userType=3)直接访问商户后台', () => {
    it('回 /merchants(代客应走新标签页,已是商户态)', () => {
      const authStore = useAuthStore()
      authStore.setToken('station-token')
      authStore.setUserInfo({ userType: 3 } as any)

      const result = resolveMerchantBusinessRoute(makeRoute('/merchant-business'))
      expect(result).toBe('/merchants')
    })
  })

  describe('非商户后台路由', () => {
    it('放行(交给其他守卫/组件)', () => {
      const authStore = useAuthStore()
      authStore.setToken('station-token')
      authStore.setUserInfo({ userType: 3 } as any)

      const result = resolveMerchantBusinessRoute(makeRoute('/dashboard'))
      expect(result).toBeUndefined()
    })
  })

  describe('未登录或身份未知', () => {
    it('放行,交给 auth-guard 处理', () => {
      const result = resolveMerchantBusinessRoute(makeRoute('/merchant-business'))
      expect(result).toBeUndefined()
    })
  })
})
