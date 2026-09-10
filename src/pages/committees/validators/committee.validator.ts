import { z } from 'zod'

import { optionalContactPhone, optionalInt, optionalNumber, optionalPhone, optionalString } from '@/validators/common'

/** 居委会创建/编辑表单校验规则 */
export const committeeValidator = z.object({
  merchantId: optionalString,
  /** 城市居委会标识（新建必填，编辑只读） */
  merchantCode: optionalString,
  nickname: z.string().min(1, '昵称不能为空'),
  phone: optionalPhone,
  password: optionalString,
  avatar: optionalString,
  gender: optionalNumber,
  merchantName: optionalString,
  logo: optionalString,
  contactName: optionalString,
  contactPhone: optionalContactPhone,
  address: optionalString,
  signDate: optionalString,
  signFee: optionalNumber,
  serveResidents: optionalInt,
  members: optionalInt,
  remark: optionalString,
  contactUs: optionalString,
  status: optionalNumber,
})

export type CommitteeValidator = z.infer<typeof committeeValidator>
