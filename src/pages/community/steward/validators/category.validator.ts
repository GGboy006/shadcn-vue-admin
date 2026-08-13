import { z } from 'zod'

import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

/** 管家服务分类校验(对接文档 4.3) */
export const housekeeperCategoryValidator = z.object({
  categoryId: optionalNumber,
  categoryName: z.string({ required_error: '分类名称不能为空' }).min(1, '分类名称不能为空'),
  categoryCode: optionalString,
  icon: optionalString,
  description: optionalString,
  sortOrder: optionalInt,
  status: optionalNumber,
})

export type HousekeeperCategoryValidator = z.infer<typeof housekeeperCategoryValidator>
