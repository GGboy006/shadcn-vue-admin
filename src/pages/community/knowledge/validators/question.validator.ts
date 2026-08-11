import { z } from 'zod'

import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

// 快捷问答表单校验规则(对接文档 3.3)
export const questionValidator = z.object({
  questionId: optionalNumber,
  questionName: z.string().min(1, '问答名称不能为空'),
  keyword: z.string().min(1, '关键词不能为空'),
  prompt: z.string().min(1, '提示词不能为空'),
  icon: optionalString,
  sortOrder: optionalInt,
  status: optionalNumber,
})

export type QuestionValidator = z.infer<typeof questionValidator>
