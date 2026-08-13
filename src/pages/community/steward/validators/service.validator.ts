import { z } from 'zod'

import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

/** 管家服务主体校验(对接文档 4.1) */
export const housekeeperServiceValidator = z.object({
  housekeeperId: optionalNumber,
  name: z.string({ required_error: '名称不能为空' }).min(1, '名称不能为空'),
  description: optionalString,
  icon: optionalString,
  coverImage: optionalString,
  contactName: optionalString,
  contactPhone: optionalString,
  merchantId: optionalNumber,
  sortOrder: optionalInt,
  status: optionalNumber,
})

export type HousekeeperServiceValidator = z.infer<typeof housekeeperServiceValidator>
