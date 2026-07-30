import { z } from 'zod'

// 小区动态表单校验规则
export const dynamicValidator = z.object({
  uniqueCode: z.string().optional(),
  title: z.string().min(1, '标题不能为空'),
  poster: z.string().optional().or(z.literal('')),
  describes: z.string().optional().or(z.literal('')),
  content: z.string().optional().or(z.literal('')),
  original: z.string().optional().or(z.literal('')),
  keywords: z.string().optional().or(z.literal('')),
  userName: z.string().optional().or(z.literal('')),
  userPoster: z.string().optional().or(z.literal('')),
  sourceUrl: z.string().optional().or(z.literal('')),
  isEnable: z.number().optional(),
})

export type DynamicValidator = z.infer<typeof dynamicValidator>
