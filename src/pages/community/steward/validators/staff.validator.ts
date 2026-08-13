import { z } from 'zod'

import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

/** 管家服务人员校验(对接文档 4.2) */
export const housekeeperStaffValidator = z.object({
  staffId: optionalString,
  housekeeperId: z.string({ error: '请选择所属主体' }).min(1, '请选择所属主体'),
  staffName: z.string({ error: '人员姓名不能为空' }).min(1, '人员姓名不能为空'),
  phone: optionalString,
  avatar: optionalString,
  title: optionalString,
  userId: optionalNumber,
  sortOrder: optionalInt,
  status: optionalNumber,
})

export type HousekeeperStaffValidator = z.infer<typeof housekeeperStaffValidator>
