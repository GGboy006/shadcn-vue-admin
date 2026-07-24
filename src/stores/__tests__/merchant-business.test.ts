import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useMerchantBusinessStore } from '@/stores/merchant-business'
import { useUserInfoStore } from '@/stores/user-info'

describe('merchantBusiness store', () => {
  beforeEach(() => {
    // 裸 pinia:不注册 persist 插件,避免触碰 localStorage(node 环境无)
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('should start with proxyMode disabled and empty merchant info', () => {
      const store = useMerchantBusinessStore()

      expect(store.proxyMode).toBe(false)
      expect(store.merchantId).toBe('')
      expect(store.merchantName).toBe('')
    })
  })

  describe('enterProxy', () => {
    it('should enable proxy mode and store merchant id and name', () => {
      const store = useMerchantBusinessStore()

      store.enterProxy('M1001', '星巴克旗舰店')

      expect(store.proxyMode).toBe(true)
      expect(store.merchantId).toBe('M1001')
      expect(store.merchantName).toBe('星巴克旗舰店')
    })

    it('should overwrite previous proxy target when called again', () => {
      const store = useMerchantBusinessStore()

      store.enterProxy('M1001', '星巴克旗舰店')
      store.enterProxy('M2002', '瑞幸咖啡')

      expect(store.proxyMode).toBe(true)
      expect(store.merchantId).toBe('M2002')
      expect(store.merchantName).toBe('瑞幸咖啡')
    })
  })

  describe('clear', () => {
    it('should reset proxy mode and merchant info to defaults', () => {
      const store = useMerchantBusinessStore()
      store.enterProxy('M1001', '星巴克旗舰店')

      store.clear()

      expect(store.proxyMode).toBe(false)
      expect(store.merchantId).toBe('')
      expect(store.merchantName).toBe('')
    })
  })

  describe('initSelf', () => {
    it('should take merchantId from userInfo store and disable proxy mode', () => {
      const userInfoStore = useUserInfoStore()
      userInfoStore.setMerchantInfo({
        merchantId: 'M_SELF',
        merchantName: '我的商户',
      } as any)

      const store = useMerchantBusinessStore()
      store.enterProxy('M_OTHER', '其他商户') // 模拟此前处于代客态

      store.initSelf()

      expect(store.proxyMode).toBe(false)
      expect(store.merchantId).toBe('M_SELF')
      // 自身模式顶栏不显示商户名
      expect(store.merchantName).toBe('')
    })

    it('should leave merchantId empty when userInfo has no merchantInfo', () => {
      // 不设置 merchantInfo,initSelf 应容错为空
      const store = useMerchantBusinessStore()

      store.initSelf()

      expect(store.proxyMode).toBe(false)
      expect(store.merchantId).toBe('')
      expect(store.merchantName).toBe('')
    })
  })

  describe('state transitions', () => {
    it('should support full lifecycle: enter -> clear -> enter -> initSelf', () => {
      const store = useMerchantBusinessStore()

      store.enterProxy('M1', '商户一')
      expect(store.proxyMode).toBe(true)

      store.clear()
      expect(store.proxyMode).toBe(false)

      store.enterProxy('M2', '商户二')
      expect(store.merchantId).toBe('M2')

      const userInfoStore = useUserInfoStore()
      userInfoStore.setMerchantInfo({ merchantId: 'M_SELF' } as any)
      store.initSelf()
      expect(store.proxyMode).toBe(false)
      expect(store.merchantId).toBe('M_SELF')
    })
  })
})
