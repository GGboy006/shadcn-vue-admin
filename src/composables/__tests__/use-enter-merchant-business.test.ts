import { beforeEach, describe, expect, it, vi } from 'vitest'

// mock 换 token 接口
const fetchMerchantTokenMock = vi.fn()
vi.mock('@/services/api/proxy-login.api', () => ({
  fetchMerchantToken: (merchantId: string) => fetchMerchantTokenMock(merchantId),
}))

// mock vue-sonner toast(node 环境无 DOM)
vi.mock('vue-sonner', () => ({
  toast: {
    message: vi.fn(),
    error: vi.fn(),
  },
}))

// 必须在 mock 之后导入被测模块
const { useEnterMerchantBusiness } = await import('@/composables/use-enter-merchant-business')
const { readProxyAuth } = await import('@/utils/proxy-auth')

interface Payload {
  token: string
  user: { nickname: string, avatar: string, gender: number, phone: string, userType: number }
}

const fakePayload: Payload = {
  token: 'merchant-token-xyz',
  user: { nickname: '星巴克', avatar: '', gender: 0, phone: '13800000000', userType: 4 },
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

describe('useEnterMerchantBusiness', () => {
  const openMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('sessionStorage', makeStorage())
    vi.stubGlobal('localStorage', makeStorage())
    vi.stubGlobal('window', { open: openMock, location: { origin: 'http://localhost' } })
    fetchMerchantTokenMock.mockReset()
    openMock.mockReset()
  })

  it('同步先打开新标签页(URL 含 proxy=1&k=),再异步换 token', async () => {
    fetchMerchantTokenMock.mockResolvedValue(fakePayload)

    const { enterMerchantBusiness } = useEnterMerchantBusiness()
    await enterMerchantBusiness('M1001', '星巴克旗舰店')

    // window.open 被调用,URL 含 proxy 与 k
    expect(openMock).toHaveBeenCalledTimes(1)
    const url = openMock.mock.calls[0][0] as string
    expect(url).toContain('proxy=1')
    expect(url).toMatch(/k=.+/)

    // 换 token 接口以 merchantId 调用
    expect(fetchMerchantTokenMock).toHaveBeenCalledWith('M1001')

    // open 先于 fetchMerchantToken(同步开窗在 await 之前,避免弹窗拦截)
    expect(openMock.mock.invocationCallOrder[0]).toBeLessThan(fetchMerchantTokenMock.mock.invocationCallOrder[0])
  })

  it('换 token 成功后,中转只写 token+user(不含 merchantInfo,后者入口页用新 token 取)', async () => {
    fetchMerchantTokenMock.mockResolvedValue(fakePayload)

    const { enterMerchantBusiness } = useEnterMerchantBusiness()
    await enterMerchantBusiness('M1001', '星巴克旗舰店')

    const url = openMock.mock.calls[0][0] as string
    const k = new URLSearchParams(url.split('?')[1]).get('k')!
    const data = readProxyAuth<Payload>(k)
    expect(data).toEqual(fakePayload)
    // 中转不含 merchantInfo 字段
    expect(data).not.toHaveProperty('merchantInfo')
  })

  it('换 token 失败时不抛异常(新标签页将因中转超时显示错误)', async () => {
    fetchMerchantTokenMock.mockRejectedValue(new Error('网络错误'))

    const { enterMerchantBusiness } = useEnterMerchantBusiness()
    await expect(enterMerchantBusiness('M1001', '星巴克旗舰店')).resolves.not.toThrow()

    // open 已调用(先开窗),但中转未写入
    expect(openMock).toHaveBeenCalledTimes(1)
    const url = openMock.mock.calls[0][0] as string
    const k = new URLSearchParams(url.split('?')[1]).get('k')!
    expect(readProxyAuth(k)).toBeNull()
  })
})
