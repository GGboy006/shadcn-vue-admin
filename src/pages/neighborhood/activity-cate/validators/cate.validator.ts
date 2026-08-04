import { z } from 'zod'

import { optionalInt } from '@/validators/common'

/** 活动分类表单校验规则 */
export const cateValidator = z.object({
  uniqueCode: z.string().optional(),
  name: z.string().min(1, '分类名称不能为空'),
  torder: optionalInt,
  isEnable: z.union([z.literal(1), z.literal(2)]).optional(),
})

export type CateValidator = z.infer<typeof cateValidator>
