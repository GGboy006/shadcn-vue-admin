import { z } from 'zod'

import { optionalNumber, optionalString } from '@/validators/common'

/** 社区电话表单校验规则(对接文档 7 节) */
export const communityPhoneValidator = z.object({
  uniqueCode: optionalString,
  title: z.string().min(1, '标题不能为空'),
  poster: optionalString,
  type: optionalNumber,
  isEnable: optionalNumber,
  regionPhone: optionalString,
  workTime: optionalString,
  contactUser: optionalString,
  contactPhone: optionalString,
  customerServiceWeixin: optionalString,
  wechatQrcode: optionalString,
})

export type CommunityPhoneValidator = z.infer<typeof communityPhoneValidator>
