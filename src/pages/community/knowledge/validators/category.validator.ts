import { z } from 'zod'

import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

// 知识分类表单校验规则(对接文档 3.1)
export const categoryValidator = z.object({
  categoryId: optionalString,
  categoryName: z.string().min(1, '分类名称不能为空'),
  categoryType: optionalNumber,
  icon: optionalString,
  description: optionalString,
  sortOrder: optionalInt,
  status: optionalNumber,
})

export type CategoryValidator = z.infer<typeof categoryValidator>
