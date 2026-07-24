import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useCurrentMerchantId } from '@/composables/use-current-merchant-id'
import { useMerchantBusinessStore } from '@/stores/merchant-business'

describe('useCurrentMerchantId', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should expose merchantId, proxyMode, merchantName as refs', () => {
    const { merchantId, proxyMode, merchantName } = useCurrentMerchantId()

    expect(merchantId.value).toBe('')
    expect(proxyMode.value).toBe(false)
    expect(merchantName.value).toBe('')
  })

  it('should react to store enterProxy changes', () => {
    const { merchantId, proxyMode, merchantName } = useCurrentMerchantId()
    const store = useMerchantBusinessStore()

    store.enterProxy('M1001', '星巴克')

    expect(proxyMode.value).toBe(true)
    expect(merchantId.value).toBe('M1001')
    expect(merchantName.value).toBe('星巴克')
  })

  it('should react to store clear changes', () => {
    const store = useMerchantBusinessStore()
    store.enterProxy('M1001', '星巴克')

    const { merchantId, proxyMode } = useCurrentMerchantId()
    store.clear()

    expect(proxyMode.value).toBe(false)
    expect(merchantId.value).toBe('')
  })
})
