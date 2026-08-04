import { z } from 'zod'

import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

/** 居委会公告表单校验规则 */
export const noticeValidator = z.object({
  uniqueCode: optionalString,
  title: z.string().min(1, '标题不能为空'),
  introduction: optionalString,
  content: optionalString,
  contentType: optionalNumber,
  h5Url: optionalString,
  isPublic: optionalNumber,
  torder: optionalInt,
})

export type NoticeValidator = z.infer<typeof noticeValidator>
