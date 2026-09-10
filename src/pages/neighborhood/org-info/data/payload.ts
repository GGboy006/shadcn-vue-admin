import type { INeighborhoodOrgUpdateDTO } from '@/services/api/neighborhood-org.api'

/** 居委会信息表单值 */
export interface OrgInfoFormValues {
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
  contactName?: string
  contactPhone?: string
  address?: string
  signDate?: string
  signFee?: number
  /** 服务居民数(居委会特有) */
  serveResidents?: number
  /** 成员数(居委会特有) */
  members?: number
  remark?: string
  /** 联系我们(富文本 HTML) */
  contactUs?: string
  status?: 1 | 2
}

/**
 * 构建居委会信息更新请求体(对接文档 2.2 BusinessOrgUpdateDTO)。
 *
 * - merchantId 必填
 * - password 为空字符串时不写入(不改密码)
 * - 其余可选字段 undefined 时不写入
 * - orgCode 由后端自动注入,前端不传
 */
export function buildOrgInfoPayload(values: OrgInfoFormValues): INeighborhoodOrgUpdateDTO {
  if (!values.merchantId) {
    throw new Error('居委会ID不能为空')
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
    'contactName',
    'contactPhone',
    'address',
    'signDate',
    'signFee',
    'serveResidents',
    'members',
    'remark',
    'contactUs',
    'status',
  ] as const

  const payload: Record<string, unknown> = {
    merchantId: values.merchantId,
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

  return payload as unknown as INeighborhoodOrgUpdateDTO
}
