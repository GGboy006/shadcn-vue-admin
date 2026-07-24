import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useMerchantBusinessStore } from '@/stores/merchant-business'

// mock useRouter:返回带 push spy 的对象
const pushMock = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

// 必须在 mock 之后导入被测模块
const { useEnterMerchantBusiness } = await import('@/composables/use-enter-merchant-business')

describe('useEnterMerchantBusiness', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    pushMock.mockClear()
  })

  it('should enter proxy mode and push to /merchant-business with mId', () => {
    const store = useMerchantBusinessStore()
    const { enterMerchantBusiness } = useEnterMerchantBusiness()

    enterMerchantBusiness('M1001', '星巴克')

    // store 已写入代客态
    expect(store.proxyMode).toBe(true)
    expect(store.merchantId).toBe('M1001')
    expect(store.merchantName).toBe('星巴克')
    // 路由跳转带 mId
    expect(pushMock).toHaveBeenCalledWith({ path: '/merchant-business', query: { mId: 'M1001' } })
  })

  it('should call store.enterProxy before router.push', () => {
    const store = useMerchantBusinessStore()
    const enterSpy = vi.spyOn(store, 'enterProxy')
    const { enterMerchantBusiness } = useEnterMerchantBusiness()

    enterMerchantBusiness('M2002', '瑞幸')

    // enterProxy 先于 push 被调用(保证跳转时代客态已就绪)
    expect(enterSpy.mock.invocationCallOrder[0]).toBeLessThan(pushMock.mock.invocationCallOrder[0])
    expect(enterSpy).toHaveBeenCalledWith('M2002', '瑞幸')
  })
})
