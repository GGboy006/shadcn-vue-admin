import type { IFaqAddReq, IFaqUpdateReq } from '@/services/api/merchant-business.api'

import type { FaqFormValues } from './schema'

/**
 * 构建 FAQ 新增/更新请求体。
 *
 * - 有 faqCode -> 更新(IFaqUpdateReq)
 * - 无 faqCode -> 新增(IFaqAddReq)
 * - question / answer 为空抛错(表单校验兜底)
 * - 可选字段(categoryName/torder/isEnable)为 undefined 时不写入
 */
export function buildFaqPayload(values: FaqFormValues, faqCode?: string): IFaqAddReq | IFaqUpdateReq {
  if (!values.question.trim()) {
    throw new Error('问题不能为空')
  }
  if (!values.answer.trim()) {
    throw new Error('答案不能为空')
  }

  const base = {
    question: values.question,
    answer: values.answer,
    ...(values.categoryName !== undefined ? { categoryName: values.categoryName } : {}),
    ...(values.torder !== undefined ? { torder: values.torder } : {}),
    ...(values.isEnable !== undefined ? { isEnable: values.isEnable } : {}),
  }

  if (faqCode) {
    return { faqCode, ...base } as IFaqUpdateReq
  }
  return base as IFaqAddReq
}
