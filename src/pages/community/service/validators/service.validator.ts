import { z } from 'zod'

import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

/** 小区服务表单校验规则(对接文档 13 节) */
export const communityServiceValidator = z.object({
  uniqueCode: optionalString,
  name: z.string().min(1, '名称不能为空'),
  poster: optionalString,
  backgroundPoster: optionalString,
  describe: optionalString,
  torder: optionalInt,
  isEnable: optionalNumber,
  location: optionalNumber,
  type: optionalNumber,
  cateCode: optionalString,
  cateName: optionalString,
  serviceType: optionalNumber,
  otherCode: optionalString,
  appId: optionalString,
  originalAppId: optionalString,
  bdAppKey: optionalString,
  readingCode: optionalString,
  serviceCode: optionalString,
  h5Url: optionalString,
  appUrl: optionalString,
  linkUrl: optionalString,
  address: optionalString,
  businessHours: optionalString,
  serviceList: optionalString,
})

export type CommunityServiceValidator = z.infer<typeof communityServiceValidator>
