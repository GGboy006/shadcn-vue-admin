import { z } from 'zod'

// 用户状态枚举
export const userStatusSchema = z.enum(['active', 'inactive', 'invited', 'suspended'])
export type UserStatus = z.infer<typeof userStatusSchema>

// 用户角色枚举
export const userRoleSchema = z.enum(['superadmin', 'admin', 'cashier', 'manager'])
export type UserRole = z.infer<typeof userRoleSchema>

// 用户数据模型
export const userSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  status: userStatusSchema,
  role: userRoleSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type User = z.infer<typeof userSchema>

// 用户列表模型
export const userListSchema = z.array(userSchema)
