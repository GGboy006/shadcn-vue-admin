import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useCurrentMerchantId } from '@/composables/use-current-merchant-id'
import { useUserInfoStore } from '@/stores/user-info'
import { markProxyTab } from '@/utils/proxy-auth'

const merchantInfo = {
  merchantId: 'M1001',
  merchantName: '星巴克旗舰店',
  merchantCode: 'CODE1001',
  nickname: '星巴克',
  phone: '13800000000',
  avatar: '',
  gender: 0,
  userStatus: 1,
  lastLoginTime: '',
  categoryCode: 'C1',
  logo: '',
  bannerImages: '',
  stationUserId: 'S1',
  type: 4,
  contactName: '张三',
  contactPhone: '13800000000',
  address: '',
  externalUrl: '',
  signDate: '',
  signFee: 0,
  businessStatus: 1,
  businessHours: '',
  minDeliveryAmount: 0,
  deliveryFee: 0,
  settlementCycle: 1,
  status: 1,
  remark: '',
}

function makeStorage() {
  const store = new Map<string, string>()
  return {
    getItem: vi.fn((k: string) => store.get(k) ?? null),
    setItem: vi.fn((k: string, v: string) => { store.set(k, String(v)) }),
    removeItem: vi.fn((k: string) => { store.delete(k) }),
    clear: vi.fn(() => store.clear()),
    get length() { return store.size },
    key: vi.fn((i: number) => [...store.keys()][i] ?? null),
  } as unknown as Storage
}

describe('useCurrentMerchantId', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('sessionStorage', makeStorage())
    vi.stubGlobal('localStorage', makeStorage())
    vi.stubGlobal('window', { location: { search: '' } })
  })

  it('merchantInfo 为空时返回空串,proxyMode 为 false', () => {
    const { merchantId, merchantName, proxyMode } = useCurrentMerchantId()
    expect(merchantId.value).toBe('')
    expect(merchantName.value).toBe('')
    expect(proxyMode.value).toBe(false)
  })

  it('merchantId/merchantName 来自 userInfoStore.merchantInfo', () => {
    const userInfoStore = useUserInfoStore()
    userInfoStore.setMerchantInfo(merchantInfo)

    const { merchantId, merchantName } = useCurrentMerchantId()
    expect(merchantId.value).toBe('M1001')
    expect(merchantName.value).toBe('星巴克旗舰店')
  })

  it('proxyMode 反映代客标签页标记(sessionStorage)', () => {
    // 普通标签页:无标记 -> false
    const { proxyMode } = useCurrentMerchantId()
    expect(proxyMode.value).toBe(false)

    // 标记为代客标签页后,新 composable 实例读取为 true
    markProxyTab()
    const { proxyMode: proxyMode2 } = useCurrentMerchantId()
    expect(proxyMode2.value).toBe(true)
  })
})
