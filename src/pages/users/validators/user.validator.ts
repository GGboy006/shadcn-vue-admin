import { z } from 'zod'

import { userRoleSchema, userStatusSchema } from '../data/schema'

// 用户表单校验规则
export const userValidator = z.object({
  id: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  username: z.string().min(1),
  email: z.email().min(1),
  phoneNumber: z.string().min(1),
  status: userStatusSchema,
  role: userRoleSchema,
})

export type UserValidator = z.infer<typeof userValidator>
