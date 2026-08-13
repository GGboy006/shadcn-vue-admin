import { z } from 'zod'

/** 意见反馈回复校验(对接文档 2.6,replyContent 必填 ≤2000) */
export const feedbackReplyValidator = z.object({
  replyContent: z
    .string({ error: '回复内容不能为空' })
    .min(1, '回复内容不能为空')
    .max(2000, '回复内容不能超过 2000 字'),
})

export type FeedbackReplyValidator = z.infer<typeof feedbackReplyValidator>
