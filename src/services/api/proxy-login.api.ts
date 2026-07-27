import type { LoginUserVO } from '@/stores/auth'

import { useApiFetch } from '@/composables/use-fetch'

import type { IResponse } from '../types/response.type'

/**
 * 代客换商户 token 响应:复用登录响应结构(仅 token + user,不含 merchantInfo)。
 *
 * 后端校验站长 token 对 merchantId 的代客权限后,签发该商户视角的 token。
 * merchantInfo 由前端拿到 token 后另行调用 /merchant/myMerchantInfo 获取
 * (与正常 password 登录的两步流程一致,以便复用 myMerchantInfo 逻辑、保证字段一致)。
 *
 * 注意:userType 由后端按 merchantId 查出的商户 type 透传(4=商户 / 5=物业 / 6=居委会),
 * 不固定为 4。前端不硬编码,直接 setUserInfo 透传。
 *
 * refreshToken / expireTime 为后端附带字段,当前前端未使用(项目暂无刷新 token 机制),
 * 标记为可选以便将来启用。
 */
export interface IProxyLoginResp {
  token: string
  user: LoginUserVO
  /** 刷新 token(后端附带,前端暂未使用) */
  refreshToken?: string
  /** token 过期时间(后端附带,前端暂未使用) */
  expireTime?: string
}

/**
 * 站长代客换商户 token。
 *
 * 站长 token(请求头自动注入)+ merchantId(路径参数)-> 商户 token + 商户视角 user。
 * 随后前端用新 token 调 /merchant/myMerchantInfo 取 merchantInfo。
 */
export async function fetchMerchantToken(merchantId: string): Promise<IProxyLoginResp> {
  const { apiFetch } = useApiFetch()
  const res = await apiFetch<IResponse<IProxyLoginResp>>(`/login/merchantToken/${merchantId}`, {
    method: 'GET',
  })
  return res.data
}
