import { z } from 'zod'

import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

/** 居委会广告表单校验规则 */
export const bannerValidator = z.object({
  uniqueCode: optionalString,
  position: optionalNumber,
  name: z.string().min(1, '名称不能为空'),
  poster: z.string().min(1, '图片不能为空'),
  type: optionalNumber,
  resCode: optionalString,
  startTime: optionalString,
  endTime: optionalString,
  torder: optionalInt,
  isEnable: optionalNumber,
})

export type BannerValidator = z.infer<typeof bannerValidator>
