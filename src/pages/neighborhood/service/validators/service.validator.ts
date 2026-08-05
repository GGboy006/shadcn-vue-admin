import { z } from 'zod'

import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

/** 居委会服务表单校验规则 */
export const serviceValidator = z.object({
  uniqueCode: optionalString,
  name: z.string().min(1, '名称不能为空'),
  type: optionalNumber,
  poster: optionalString,
  appId: optionalString,
  originalAppId: optionalString,
  bdAppKey: optionalString,
  h5Url: optionalString,
  torder: optionalInt,
  isEnable: optionalNumber,
  resCode: optionalString,
})

export type ServiceValidator = z.infer<typeof serviceValidator>
