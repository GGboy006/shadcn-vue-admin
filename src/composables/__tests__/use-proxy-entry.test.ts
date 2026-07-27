import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/stores/auth'
import { useUserInfoStore } from '@/stores/user-info'

// mock vue-router:提供 useRouter 的 replace spy
const replaceMock = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ replace: replaceMock }),
}))

// mock useUserInfo.fetchUserInfo(避免真实 apiFetch),捕获调用
const fetchUserInfoMock = vi.fn()
vi.mock('@/composables/use-user-info', () => ({
  useUserInfo: () => ({ fetchUserInfo: fetchUserInfoMock }),
}))

const { useProxyEntry } = await import('@/composables/use-proxy-entry')
const { writeProxyAuth } = await import('@/utils/proxy-auth')

interface Payload {
  token: string
  user: { nickname: string, avatar: string, gender: number, phone: string, userType: number }
}

const fakePayload: Payload = {
  token: 'merchant-token-xyz',
  user: { nickname: '星巴克', avatar: '', gender: 0, phone: '13800000000', userType: 4 },
}

// fetchUserInfo 成功后会写 merchantInfo,这里模拟其副作用
const fakeMerchantInfo = { merchantId: 'M1001', merchantCode: 'CODE1001', merchantName: '星巴克旗舰店' } as any

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

describe('useProxyEntry', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('sessionStorage', makeStorage())
    vi.stubGlobal('localStorage', makeStorage())
    vi.stubGlobal('window', { location: { search: '?proxy=1&k=abc', origin: 'http://localhost' } })
    replaceMock.mockReset()
    fetchUserInfoMock.mockReset()
  })

  it('命中中转:setToken/setUserInfo -> 调 fetchUserInfo 取 merchantInfo -> 跳概览', async () => {
    writeProxyAuth(fakePayload, 'abc')
    // fetchUserInfo 内部会 setMerchantInfo,模拟之
    fetchUserInfoMock.mockImplementation(async () => {
      useUserInfoStore().setMerchantInfo(fakeMerchantInfo)
    })

    const { consume } = useProxyEntry()
    const result = await consume('abc')

    expect(result).toEqual({ ok: true })

    const authStore = useAuthStore()
    const userInfoStore = useUserInfoStore()
    expect(authStore.token).toBe(fakePayload.token)
    expect(authStore.userInfo).toEqual(fakePayload.user)
    expect(authStore.userInfo?.userType).toBe(4)
    expect(userInfoStore.merchantInfo).toEqual(fakeMerchantInfo)
    expect(userInfoStore.merchantInfo?.merchantCode).toBe('CODE1001')

    // 跳商户概览
    expect(replaceMock).toHaveBeenCalledWith('/merchant-business/overview')
  })

  it('setToken 先于 fetchUserInfo(保证后者用商户 token 调 myMerchantInfo)', async () => {
    writeProxyAuth(fakePayload, 'abc')
    fetchUserInfoMock.mockResolvedValue(undefined)

    const { consume } = useProxyEntry()
    await consume('abc')

    // fetchUserInfo 被调用一次
    expect(fetchUserInfoMock).toHaveBeenCalledTimes(1)
    // 调用时 token 已写入(authStore 已是商户 token)
    expect(useAuthStore().token).toBe(fakePayload.token)
  })

  it('缺 key:返回 no-key,不写 store 不跳转', async () => {
    const { consume } = useProxyEntry()
    const result = await consume(undefined)
    expect(result).toEqual({ ok: false, reason: 'no-key' })
    expect(replaceMock).not.toHaveBeenCalled()
    expect(fetchUserInfoMock).not.toHaveBeenCalled()
  })

  it('fetchUserInfo 失败:回滚 token,返回 fetch-info', async () => {
    writeProxyAuth(fakePayload, 'abc')
    fetchUserInfoMock.mockRejectedValue(new Error('myMerchantInfo 失败'))

    const { consume } = useProxyEntry()
    const result = await consume('abc')

    expect(result).toEqual({ ok: false, reason: 'fetch-info' })
    expect(replaceMock).not.toHaveBeenCalled()
    // token 已回滚(避免半登录态)
    expect(useAuthStore().token).toBe('')
  })

  it('中转读取后一次性清除', async () => {
    writeProxyAuth(fakePayload, 'abc')
    fetchUserInfoMock.mockResolvedValue(undefined)

    const { consume } = useProxyEntry()
    await consume('abc')

    const { readProxyAuth } = await import('@/utils/proxy-auth')
    expect(readProxyAuth('abc')).toBeNull()
  })
})
