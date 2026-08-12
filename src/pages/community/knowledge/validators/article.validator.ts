import { z } from 'zod'

import { optionalNumber, optionalString } from '@/validators/common'

// 知识文章表单校验规则(对接文档 3.2)
export const articleValidator = z.object({
  articleId: optionalNumber,
  categoryId: optionalNumber,
  title: z.string().min(1, '标题不能为空'),
  content: z.string().min(1, '正文不能为空'),
  summary: optionalString,
  coverImage: optionalString,
  source: optionalString,
  author: optionalString,
  topFlag: optionalNumber,
  publishStatus: optionalNumber,
})

export type ArticleValidator = z.infer<typeof articleValidator>
