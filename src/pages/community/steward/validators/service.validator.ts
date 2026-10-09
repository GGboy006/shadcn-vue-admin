import { z } from 'zod'

import { stationHousekeeperAccountIssues } from '@/services/api/housekeeper-account'
import { optionalContactPhone, optionalInt, optionalNumber, optionalString } from '@/validators/common'

/** 管家服务主体校验。开户和第三方网点规则见 stationHousekeeperAccountIssues */
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
  providerType: optionalNumber,
  providerCode: optionalString,
  loginPhone: optionalString,
  password: optionalString,
  accountOpened: z.boolean().optional(),
}).superRefine((values, ctx) => {
  const providerType = values.providerType === 2 ? 2 : 1
  for (const issue of stationHousekeeperAccountIssues({
    housekeeperId: values.housekeeperId,
    providerType,
    providerCode: values.providerCode,
    loginPhone: values.loginPhone,
    password: values.password,
    accountOpened: values.accountOpened,
  })) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [issue.path], message: issue.message })
  }
})

export type HousekeeperServiceValidator = z.infer<typeof housekeeperServiceValidator>
