import { z } from 'zod'

import { optionalContactPhone, optionalInt, optionalNumber, optionalString } from '@/validators/common'

import { joinStaffSkills, splitStaffSkills } from '../../../community/steward/validators/staff.validator'

export { joinStaffSkills, splitStaffSkills }

export const partnerStaffValidator = z.object({
  staffId: optionalString,
  staffName: z.string({ error: '人员姓名不能为空' }).min(1, '人员姓名不能为空'),
  phone: optionalContactPhone,
  avatar: optionalString,
  serviceScope: optionalString,
  serviceSkillsText: optionalString,
  description: optionalString,
  unitPrice: optionalNumber,
  priceUnit: optionalString,
  score: optionalNumber,
  sortOrder: optionalInt,
  status: optionalNumber,
})

export type PartnerStaffValidator = z.infer<typeof partnerStaffValidator>
