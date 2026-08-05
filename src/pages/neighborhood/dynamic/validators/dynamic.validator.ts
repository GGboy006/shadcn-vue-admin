import { z } from 'zod'

import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

/** 居委会资讯动态表单校验规则 */
export const dynamicValidator = z.object({
  uniqueCode: optionalString,
  title: z.string().min(1, '标题不能为空'),
  poster: optionalString,
  contentType: optionalNumber,
  content: optionalString,
  describes: optionalString,
  original: optionalString,
  sourceUrl: optionalString,
  keywords: optionalString,
  authorName: optionalString,
  status: optionalNumber,
  torder: optionalInt,
  isEnable: optionalNumber,
})

export type DynamicValidator = z.infer<typeof dynamicValidator>
