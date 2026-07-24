import type { IMerchantBusinessUpdateDTO } from '@/services/api/merchant-business.api'

/** 商户资料表单值 */
export interface ProfileFormValues {
  merchantId: string
  nickname?: string
  phone?: string
  password?: string
  avatar?: string
  gender?: 0 | 1 | 2
  merchantName?: string
  logo?: string
  bannerImages?: string[]
  otherImages?: string[]
  type: 4 | 5 | 6
  systemFaqId?: number
  contactName?: string
  contactPhone?: string
  address?: string
  externalUrl?: string
  signDate?: string
  signFee?: number
  businessStatus?: 1 | 2 | 3 | 4
  businessHours?: string
  consumptionPerCapita?: number
  settlementCycle?: 1 | 2 | 3
  remark?: string
  status?: 1 | 2
}

/**
 * 构建商户资料更新请求体。
 *
 * - merchantId / type 必填
 * - password 为空字符串时不写入(不改密码)
 * - 其余可选字段 undefined 时不写入
 */
export function buildProfilePayload(values: ProfileFormValues): IMerchantBusinessUpdateDTO {
  if (!values.merchantId) {
    throw new Error('商户ID不能为空')
  }
  if (!values.type) {
    throw new Error('商户类型不能为空')
  }

  const OPTIONAL_FIELDS = [
    'nickname',
    'phone',
    'avatar',
    'gender',
    'merchantName',
    'logo',
    'bannerImages',
    'otherImages',
    'systemFaqId',
    'contactName',
    'contactPhone',
    'address',
    'externalUrl',
    'signDate',
    'signFee',
    'businessStatus',
    'businessHours',
    'consumptionPerCapita',
    'settlementCycle',
    'remark',
    'status',
  ] as const

  const payload: Record<string, unknown> = {
    merchantId: values.merchantId,
    type: values.type,
  }
  OPTIONAL_FIELDS.forEach((field) => {
    const value = values[field]
    if (value !== undefined) {
      payload[field] = value
    }
  })
  // password 仅在非空时写入(留空则不修改)
  if (values.password) {
    payload.password = values.password
  }

  return payload as unknown as IMerchantBusinessUpdateDTO
}
