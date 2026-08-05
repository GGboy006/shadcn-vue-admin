import { z } from 'zod'

import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

/** 居委会栏目表单校验规则 */
export const unifiedValidator = z.object({
  uniqueCode: optionalString,
  name: z.string().min(1, '名称不能为空'),
  type: optionalNumber,
  poster: optionalString,
  torder: optionalInt,
  position: optionalNumber,
  isEnable: optionalNumber,
  resCode: optionalString,
})

export type UnifiedValidator = z.infer<typeof unifiedValidator>
