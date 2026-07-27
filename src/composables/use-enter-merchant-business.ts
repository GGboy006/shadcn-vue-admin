import { toast } from 'vue-sonner'

import { BASE_URL } from '@/constants/app-config'
import { fetchMerchantToken } from '@/services/api/proxy-login.api'
import { generateProxyKey, writeProxyAuth } from '@/utils/proxy-auth'

/**
 * 站长代客进入商户后台(新标签页 + 换商户 token)。
 *
 * 流程:
 * 1. 同步 window.open 代客入口页(在用户手势内,避免弹窗拦截),URL 带 proxy=1&k
 * 2. 异步调换 token 接口(站长 token + merchantId -> 商户 token + 商户视角 user)
 * 3. 成功后写 localStorage 中转 {token, user}(供新标签页读取);失败则新标签页因中转超时显示错误
 *
 * 新标签页 /auth/proxy-entry 启动后:读中转 -> setToken/setUserInfo ->
 * 用新 token 调 /merchant/myMerchantInfo 取 merchantInfo -> 跳商户概览。
 * 换 token 必须在站长标签页完成(代客入口页 sessionStorage 为空,无站长 token 可用)。
 */
export function useEnterMerchantBusiness() {
  async function enterMerchantBusiness(merchantId: string, merchantName?: string) {
    const key = generateProxyKey()
    // 同步开窗(用户手势内),URL 仅带 key,不暴露 merchantId
    // 拼 BASE_URL 前缀(生产 base 可能是 /xiaoqu-c/),否则路由 404
    window.open(`${BASE_URL}auth/proxy-entry?proxy=1&k=${encodeURIComponent(key)}`, '_blank')

    if (merchantName)
      toast.message(`正在进入「${merchantName}」商户后台...`)

    try {
      const res = await fetchMerchantToken(merchantId)
      // 中转只存 token + user;merchantInfo 由入口页用新 token 调 myMerchantInfo 获取
      writeProxyAuth({ token: res.token, user: res.user }, key)
    }
    catch {
      toast.error('进入商户后台失败,请重试')
      // 中转未写入,新标签页将因超时显示错误
    }
  }

  return {
    enterMerchantBusiness,
  }
}
