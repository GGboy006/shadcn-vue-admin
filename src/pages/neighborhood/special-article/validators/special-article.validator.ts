import { z } from 'zod'

import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

/** 居委会专题文章表单校验规则 */
export const specialArticleValidator = z.object({
  uniqueCode: optionalString,
  specialCode: optionalString,
  title: z.string().min(1, '标题不能为空'),
  poster: optionalString,
  posterAppMin: optionalString,
  articleType: optionalNumber,
  articleImg1: optionalString,
  articleImg2: optionalString,
  articleImg3: optionalString,
  describes: optionalString,
  contentType: optionalNumber,
  content: optionalString,
  original: optionalString,
  sourceUrl: optionalString,
  keywords: optionalString,
  authorName: optionalString,
  tOrFOriginal: optionalNumber,
  isImageArticle: optionalNumber,
  imgNum: optionalInt,
  mark: optionalString,
  isEnable: optionalNumber,
  torder: optionalInt,
})

export type SpecialArticleValidator = z.infer<typeof specialArticleValidator>
