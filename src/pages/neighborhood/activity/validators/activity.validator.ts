import { z } from 'zod'

import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

/** 居委会活动表单校验规则 */
export const activityValidator = z.object({
  uniqueCode: optionalString,
  name: z.string().min(1, '活动名称不能为空'),
  poster: z.string().min(1, '封面图不能为空'),
  detailPoster: optionalString,
  sponsorName: optionalString,
  cateCode: optionalString,
  cateName: optionalString,
  describes: optionalString,
  content: optionalString,
  address: optionalString,
  isCharge: optionalNumber,
  salePrice: optionalNumber,
  startTime: optionalString,
  endTime: optionalString,
  status: optionalNumber,
  torder: optionalInt,
  isRecommend: optionalNumber,
  isEnable: optionalNumber,
})

export type ActivityValidator = z.infer<typeof activityValidator>
