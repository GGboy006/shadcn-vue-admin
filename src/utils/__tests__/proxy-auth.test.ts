import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  clearProxyAuth,
  clearProxyTab,
  generateProxyKey,
  isProxyTab,
  markProxyTab,
  readProxyAuth,
  resolveAuthStorage,
  waitForProxyAuth,
  writeProxyAuth,
} from '@/utils/proxy-auth'

interface ProxyPayload {
  token: string
  user: { nickname: string, userType: number }
  merchantInfo: { merchantId: string, merchantName: string }
}

/** 简易 Storage mock,行为对齐浏览器 Storage */
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

describe('proxy-auth utils', () => {
  beforeEach(() => {
    vi.stubGlobal('sessionStorage', makeStorage())
    vi.stubGlobal('localStorage', makeStorage())
    vi.stubGlobal('window', { location: { search: '' } })
  })

  describe('resolveAuthStorage', () => {
    it('普通标签页(无 proxy query、无标记)-> localStorage', () => {
      expect(resolveAuthStorage()).toBe(globalThis.localStorage)
    })

    it('代客入口页(URL 含 ?proxy) -> sessionStorage', () => {
      vi.stubGlobal('window', { location: { search: '?proxy=1&k=abc' } })
      expect(resolveAuthStorage()).toBe(globalThis.sessionStorage)
    })

    it('刷新代客标签页(URL 已无 proxy,但 sessionStorage 有标记) -> sessionStorage', () => {
      // 模拟 proxy-entry 已执行 markProxyTab 后,用户刷新页面(URL 变为 /merchant-business/overview)
      vi.stubGlobal('window', { location: { search: '' } })
      sessionStorage.setItem('__proxy_tab__', '1')
      expect(resolveAuthStorage()).toBe(globalThis.sessionStorage)
    })
  })

  describe('proxy-tab 标记', () => {
    it('markProxyTab 后 isProxyTab 返回 true', () => {
      expect(isProxyTab()).toBe(false)
      markProxyTab()
      expect(isProxyTab()).toBe(true)
    })

    it('clearProxyTab 后 isProxyTab 返回 false', () => {
      markProxyTab()
      clearProxyTab()
      expect(isProxyTab()).toBe(false)
    })
  })

  describe('中转数据读写(localStorage 跨标签页)', () => {
    const payload: ProxyPayload = {
      token: 'merchant-token-xyz',
      user: { nickname: '星巴克', userType: 4 },
      merchantInfo: { merchantId: 'M1001', merchantName: '星巴克旗舰店' },
    }

    it('writeProxyAuth 后 readProxyAuth 用同 key 读回', () => {
      writeProxyAuth(payload, 'k1')
      expect(readProxyAuth<ProxyPayload>('k1')).toEqual(payload)
    })

    it('不同 key 读不到(隔离)', () => {
      writeProxyAuth(payload, 'k1')
      expect(readProxyAuth<ProxyPayload>('k2')).toBeNull()
    })

    it('clearProxyAuth 后读不到(一次性)', () => {
      writeProxyAuth(payload, 'k1')
      clearProxyAuth('k1')
      expect(readProxyAuth<ProxyPayload>('k1')).toBeNull()
    })

    it('中转数据落在 localStorage(跨标签页可见),不在 sessionStorage', () => {
      writeProxyAuth(payload, 'k1')
      expect(localStorage.getItem('__proxy_auth__k1')).not.toBeNull()
      expect(sessionStorage.getItem('__proxy_auth__k1')).toBeNull()
    })
  })

  describe('generateProxyKey', () => {
    it('返回非空字符串', () => {
      const key = generateProxyKey()
      expect(typeof key).toBe('string')
      expect(key.length).toBeGreaterThan(0)
    })

    it('每次不同(避免连点覆盖)', () => {
      const keys = new Set(Array.from({ length: 20 }, () => generateProxyKey()))
      expect(keys.size).toBe(20)
    })
  })

  describe('waitForProxyAuth', () => {
    const data = { token: 't', user: { nickname: 'n' } }

    it('快路径:首次读取命中立即返回,不启动定时器', async () => {
      const read = vi.fn(() => data)
      const result = await waitForProxyAuth(read, 1000)
      expect(result).toEqual(data)
      expect(read).toHaveBeenCalledTimes(1)
    })

    it('轮询:首次为空,后续命中', async () => {
      vi.useFakeTimers()
      try {
        let count = 0
        const read = vi.fn(() => {
          count++
          return count >= 3 ? data : null
        })
        const p = waitForProxyAuth(read, 5000, 200)
        // 第 1、2 次轮询返回 null,第 3 次命中
        await vi.advanceTimersByTimeAsync(200)
        await vi.advanceTimersByTimeAsync(200)
        await vi.advanceTimersByTimeAsync(200)
        expect(await p).toEqual(data)
      }
      finally {
        vi.useRealTimers()
      }
    })

    it('超时:一直为空,返回 null', async () => {
      vi.useFakeTimers()
      try {
        const read = vi.fn(() => null)
        const p = waitForProxyAuth(read, 1000, 200)
        await vi.advanceTimersByTimeAsync(1200)
        expect(await p).toBeNull()
      }
      finally {
        vi.useRealTimers()
      }
    })
  })
})
