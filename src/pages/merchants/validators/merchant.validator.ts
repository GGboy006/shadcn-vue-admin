import { z } from 'zod'

// 商户/物业表单校验规则
export const merchantValidator = z.object({
  merchantId: z.string().optional(),
  merchantName: z.string().min(1, '商户/物业名称不能为空'),
  nickname: z.string().min(1, '昵称不能为空'),
  phone: z.string().min(1, '手机号不能为空'),
  password: z.string().min(6, '密码至少6位').optional().or(z.literal('')),
  type: z.number().min(1).max(2),
  contactPhone: z.string().min(1, '联系电话不能为空'),
  status: z.number().min(1).max(2),
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
