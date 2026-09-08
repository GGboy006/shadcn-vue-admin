import { z } from 'zod'

import { requiredPhone } from '@/validators/common'

export const accountValidator = z.object({
  stationName: z
    .string()
    .min(1, '站点名称不能为空')
    .max(50, '站点名称不能超过50个字符'),
  serviceScope: z
    .string()
    .optional(),
  address: z
    .string()
    .min(1, '站点地址不能为空')
    .max(200, '站点地址不能超过200个字符'),
  contactPhone: requiredPhone,
  remark: z
    .string()
    .max(500, '备注不能超过500个字符')
    .optional(),
})

export type AccountValidator = z.infer<typeof accountValidator>
