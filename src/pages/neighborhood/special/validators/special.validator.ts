import { z } from 'zod'

import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

/** 居委会专题表单校验规则 */
export const specialValidator = z.object({
  uniqueCode: optionalString,
  name: z.string().min(1, '专题名称不能为空'),
  poster: optionalString,
  mark: optionalString,
  isEnable: optionalNumber,
  torder: optionalInt,
})

export type SpecialValidator = z.infer<typeof specialValidator>
