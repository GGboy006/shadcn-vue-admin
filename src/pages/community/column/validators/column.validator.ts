import { z } from 'zod'

import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

/** 小区栏目表单校验规则(对接文档 11 节) */
export const communityColumnValidator = z.object({
  uniqueCode: optionalString,
  name: z.string().min(1, '名称不能为空'),
  logo: optionalString,
  type: optionalNumber,
  torder: optionalInt,
  isEnable: optionalNumber,
  appId: optionalString,
  readingCode: optionalString,
  h5Url: optionalString,
  resCode: optionalString,
})

export type CommunityColumnValidator = z.infer<typeof communityColumnValidator>
