import { z } from 'zod'

import { optionalNumber, optionalString } from '@/validators/common'

// 小区动态表单校验规则
export const dynamicValidator = z.object({
  uniqueCode: optionalString,
  title: z.string().min(1, '标题不能为空'),
  poster: optionalString,
  describes: optionalString,
  content: optionalString,
  original: optionalString,
  keywords: optionalString,
  userName: optionalString,
  userPoster: optionalString,
  sourceUrl: optionalString,
  isEnable: optionalNumber,
})

export type DynamicValidator = z.infer<typeof dynamicValidator>
