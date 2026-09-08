import { z } from 'zod'

import { optionalContactPhone, optionalNumber, optionalString, requiredPhone } from '@/validators/common'

/** 物业类型:外部产品,靠外部链接跳转,不走商户分类那套 */
export const MERCHANT_TYPE_PROPERTY = 5

// 商户/物业表单校验规则
export const merchantValidator = z.object({
  merchantId: optionalString,
  merchantName: z.string().min(1, '商户/物业名称不能为空'),
  nickname: z.string().min(1, '昵称不能为空'),
  phone: requiredPhone,
  password: z.string().min(6, '密码至少6位').optional().or(z.literal('')),
  type: z.number().min(1),
  gender: optionalNumber,
  categoryCode: optionalString,
  avatar: optionalString,
  logo: optionalString,
  contactName: optionalString,
  contactPhone: optionalContactPhone,
  address: optionalString,
  externalUrl: optionalString,
  signDate: optionalString,
  signFee: optionalNumber,
  businessHours: optionalString,
  settlementCycle: optionalNumber,
  intro: optionalString,
  remark: optionalString,
  status: optionalNumber,
}).superRefine((data, ctx) => {
  // 新建时（没有 merchantId）password 必填
  if (!data.merchantId && !data.password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '新建时密码不能为空',
      path: ['password'],
    })
  }

  const isProperty = data.type === MERCHANT_TYPE_PROPERTY

  // 物业靠外部链接承载业务，必须填且必须是 http(s) 链接
  if (isProperty) {
    const url = data.externalUrl?.trim()
    if (!url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '外部链接不能为空',
        path: ['externalUrl'],
      })
    }
    else if (!/^https?:\/\/\S+$/i.test(url)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '请填写以 http:// 或 https:// 开头的链接',
        path: ['externalUrl'],
      })
    }
    return
  }

  // 非物业（商户/居委会）仍需选分类
  if (!data.categoryCode) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '请选择商户分类',
      path: ['categoryCode'],
    })
  }
})

export type MerchantValidator = z.infer<typeof merchantValidator>
