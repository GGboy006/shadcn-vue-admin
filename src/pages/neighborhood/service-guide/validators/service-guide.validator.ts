import { z } from 'zod'

import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

/** 居委会服务热线表单校验规则 */
export const serviceGuideValidator = z.object({
  uniqueCode: optionalString,
  unit: optionalString,
  address: optionalString,
  phone: optionalString,
  describe: optionalString,
  torder: optionalInt,
  isEnable: optionalNumber,
})

export type ServiceGuideValidator = z.infer<typeof serviceGuideValidator>
