import { z } from 'zod'

import { requiredPhone } from '@/validators/common'

export const profileValidator = z.object({
  nickname: z
    .string()
    .min(1, '昵称不能为空')
    .max(30, '昵称不能超过30个字符'),
  phone: requiredPhone,
  gender: z.coerce.number().refine(val => [0, 1, 2].includes(val), {
    message: '请选择有效的性别',
  }),
  avatar: z.string().url('头像地址格式不正确').optional().or(z.literal('')),
})

export type ProfileValidator = z.infer<typeof profileValidator>
