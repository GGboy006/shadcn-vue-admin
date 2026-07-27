import type { IProxyLoginResp } from '@/services/api/proxy-login.api'

import { useAuthStore } from '@/stores/auth'
import { clearProxyAuth, markProxyTab, readProxyAuth, waitForProxyAuth } from '@/utils/proxy-auth'

import { useUserInfo } from './use-user-info'

export type ProxyEntryResult
  = | { ok: true }
    | { ok: false, reason: 'no-key' | 'timeout' | 'fetch-info' }

/**
 * 代客入口页(/auth/proxy-entry)消费中转数据的逻辑。
 *
 * 两步流程(与正常 password 登录一致):
 * 1. 轮询 localStorage 中转 {token, user}(站长标签页换 token 后写入)
 * 2. 命中:setToken + setUserInfo(写入 sessionStorage,与站长 localStorage 隔离)
 *    -> 用新商户 token 调 /merchant/myMerchantInfo 取 merchantInfo(含 merchantCode)
 *    -> setMerchantInfo -> markProxyTab -> 清中转 -> 跳商户概览
 *
 * 换 token 在站长标签页完成(代客入口页 sessionStorage 为空,无站长 token);
 * myMerchantInfo 在入口页完成(已 setToken 商户 token,onRequest 自动注入)。
 */
export function useProxyEntry() {
  const authStore = useAuthStore()
  const { fetchUserInfo } = useUserInfo()
  const router = useRouter()

  async function consume(key: string | undefined, timeoutMs = 10000): Promise<ProxyEntryResult> {
    if (!key)
      return { ok: false, reason: 'no-key' }

    const data = await waitForProxyAuth<IProxyLoginResp>(
      () => readProxyAuth<IProxyLoginResp>(key),
      timeoutMs,
    )
    if (!data)
      return { ok: false, reason: 'timeout' }

    // 第一步:写入 token + user(落 sessionStorage,与站长 localStorage 隔离)
    authStore.setToken(data.token)
    authStore.setUserInfo(data.user)

    // 第二步:用新商户 token 取 merchantInfo(复用 useUserInfo,按 userType 调 myMerchantInfo)
    try {
      await fetchUserInfo()
    }
    catch {
      // myMerchantInfo 失败:已 setToken 但无 merchantInfo,后续商户后台接口会缺 merchantId
      // 回滚 token 避免半登录态,提示错误
      authStore.clearAuth()
      return { ok: false, reason: 'fetch-info' }
    }

    markProxyTab()
    clearProxyAuth(key)
    router.replace('/merchant-business/overview')
    return { ok: true }
  }

  return { consume }
}
