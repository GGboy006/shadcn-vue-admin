import { z } from 'zod'

import { optionalInt, optionalNumber, optionalString, requiredPhone } from '@/validators/common'

/** 服务人员校验。技能在表单里用顿号/逗号拼成一段文字 */
export const housekeeperStaffValidator = z.object({
  staffId: optionalString,
  housekeeperId: z.string({ error: '请选择所属主体' }).min(1, '请选择所属主体'),
  staffName: z.string({ error: '人员姓名不能为空' }).min(1, '人员姓名不能为空'),
  phone: requiredPhone,
  avatar: optionalString,
  serviceScope: optionalString,
  serviceTime: optionalString,
  serviceSkillsText: optionalString,
  description: optionalString,
  unitPrice: optionalNumber,
  priceUnit: optionalString,
  sortOrder: optionalInt,
  status: optionalNumber,
})

export type HousekeeperStaffValidator = z.infer<typeof housekeeperStaffValidator>

export function splitStaffSkills(value?: string) {
  if (!value?.trim())
    return undefined
  const skills = value.split(/[、,，]/).map(item => item.trim()).filter(Boolean)
  return skills.length ? skills : undefined
}

export function joinStaffSkills(skills?: string[]) {
  return skills?.length ? skills.join('、') : undefined
}
