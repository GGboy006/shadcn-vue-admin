import { z } from 'zod'

import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

/** 管家服务人员校验(对接文档 4.2) */
export const housekeeperStaffValidator = z.object({
  staffId: optionalNumber,
  housekeeperId: z.union([z.number(), z.string()]).refine(
    v => v !== '' && v !== undefined && v !== null,
    '请选择所属主体',
  ).transform(Number),
  staffName: z.string({ required_error: '人员姓名不能为空' }).min(1, '人员姓名不能为空'),
  phone: optionalString,
  avatar: optionalString,
  title: optionalString,
  userId: optionalNumber,
  sortOrder: optionalInt,
  status: optionalNumber,
})

export type HousekeeperStaffValidator = z.infer<typeof housekeeperStaffValidator>
