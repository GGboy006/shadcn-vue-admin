import { z } from 'zod'

// 小区公告表单校验规则
export const noticeValidator = z.object({
  uniqueCode: z.string().optional(),
  title: z.string().min(1, '标题不能为空'),
  introduction: z.string().optional().or(z.literal('')),
  content: z.string().optional().or(z.literal('')),
  contentType: z.number().optional(),
  h5Url: z.string().optional().or(z.literal('')),
  isPublic: z.number().optional(),
  torder: z.number().optional(),
})

export type NoticeValidator = z.infer<typeof noticeValidator>
