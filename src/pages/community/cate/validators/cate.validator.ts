import { z } from 'zod'

import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

/** 小区分类表单校验规则(对接文档 12 节) */
export const communityCateValidator = z.object({
  uniqueCode: optionalString,
  name: z.string().min(1, '名称不能为空'),
  parentCode: optionalString,
  describe: optionalString,
  torder: optionalInt,
  type: optionalNumber,
  tempType: optionalNumber,
  isEnable: optionalNumber,
})

export type CommunityCateValidator = z.infer<typeof communityCateValidator>
