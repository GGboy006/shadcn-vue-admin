import { z } from 'zod'

import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

/** 会员套餐表单(对接文档 §5.6,不要收集 partnerId/regionCode) */
export const communityMemberPriceValidator = z.object({
  uniqueCode: optionalString,
  priceName: z.string().trim().min(1, '套餐名称不能为空').max(100, '套餐名称不超过 100 字'),
  price: optionalNumber.superRefine((v, ctx) => {
    if (v === undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: '售价不能为空' })
      return
    }
    if (v < 0)
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: '售价不能为负' })
  }),
  effectiveDays: optionalInt.superRefine((v, ctx) => {
    if (v === undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: '有效天数不能为空' })
      return
    }
    if (v < 1)
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: '有效天数至少 1 天' })
  }),
  remark: optionalString.refine(v => !v || v.length <= 500, '备注不超过 500 字'),
  isEnable: optionalNumber,
  sortOrder: optionalInt,
})

export type CommunityMemberPriceValidator = z.infer<typeof communityMemberPriceValidator>
