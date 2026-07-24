import type { IFaqResp } from '@/services/api/merchant-business.api'

/** FAQ 列表行类型(对应文档 4.1 IFaqResp) */
export type Faq = IFaqResp

/** FAQ 表单值(新增/编辑共用) */
export interface FaqFormValues {
  /** 标签(如:制作工艺/退换政策) */
  categoryName?: string
  /** 问题标题 */
  question: string
  /** 答案内容 */
  answer: string
  /** 排序 */
  torder?: number
  /** 状态:1=启用,2=禁用 */
  isEnable?: 1 | 2
}
