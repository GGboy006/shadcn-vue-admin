import { z } from 'zod'

import { optionalContactPhone, optionalInt, optionalNumber, optionalString } from '@/validators/common'

/** 管家服务主体校验(对接文档 4.1) */
export const housekeeperServiceValidator = z.object({
  housekeeperId: optionalString,
  name: z.string({ error: '名称不能为空' }).min(1, '名称不能为空'),
  description: optionalString,
  icon: optionalString,
  coverImage: optionalString,
  contactName: optionalString,
  contactPhone: optionalContactPhone,
  merchantId: optionalString,
  sortOrder: optionalInt,
  status: optionalNumber,
})

export type HousekeeperServiceValidator = z.infer<typeof housekeeperServiceValidator>
