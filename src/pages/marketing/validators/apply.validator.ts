import { z } from 'zod'

import { requiredPhone } from '@/validators/common'

export const APPLY_IDENTITY_OPTIONS = [
  { value: 'property', label: '物业 / 社区运营商' },
  { value: 'committee', label: '街道 / 居委会' },
  { value: 'other', label: '其他' },
] as const

/** 官网「联系实施同学」开通申请 */
export const applyValidator = z.object({
  communityName: z.string().trim().min(1, '请填写小区名称').max(40, '小区名称不超过 40 字'),
  contactName: z.string().trim().min(1, '请填写联系人').max(20, '联系人不超过 20 字'),
  phone: requiredPhone,
  identity: z.enum(['property', 'committee', 'other'], { message: '请选择您的身份' }),
  remark: z.string().trim().max(200, '备注不超过 200 字').optional(),
})

export type ApplyValidator = z.infer<typeof applyValidator>
