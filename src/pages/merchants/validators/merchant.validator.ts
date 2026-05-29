import { z } from 'zod'

// 商户/物业表单校验规则
export const merchantValidator = z.object({
  merchantId: z.string().optional(),
  merchantName: z.string().min(1, '商户/物业名称不能为空'),
  nickname: z.string().min(1, '昵称不能为空'),
  phone: z.string().min(1, '手机号不能为空'),
  password: z.string().min(6, '密码至少6位').optional().or(z.literal('')),
  type: z.number().min(1),
  gender: z.number().optional().or(z.literal(0)),
  avatar: z.string().optional().or(z.literal('')),
  logo: z.string().optional().or(z.literal('')),
  contactName: z.string().optional().or(z.literal('')),
  contactPhone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  externalUrl: z.string().optional().or(z.literal('')),
  signDate: z.string().optional().or(z.literal('')),
  signFee: z.number().optional().or(z.literal(0)),
  businessHours: z.string().optional().or(z.literal('')),
  settlementCycle: z.number().optional(),
  remark: z.string().optional().or(z.literal('')),
  status: z.number().optional(),
}).refine((data) => {
  // 新建时（没有 merchantId）password 必填
  if (!data.merchantId && !data.password) {
    return false
  }
  return true
}, {
  message: '新建时密码不能为空',
  path: ['password'],
})

export type MerchantValidator = z.infer<typeof merchantValidator>
