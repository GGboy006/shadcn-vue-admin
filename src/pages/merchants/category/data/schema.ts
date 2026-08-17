import type { IMerchantCategoryVO } from '@/services/api/merchant.api'

/** 商户分类列表行类型 */
export type MerchantCategory = IMerchantCategoryVO

/** 商户分类表单值（新增/编辑共用） */
export interface MerchantCategoryFormValues {
  /** 分类名称 */
  name: string
  /** 排序 */
  torder?: number
  /** 状态：1=启用，2=禁用 */
  status?: 1 | 2
}

/** 商户分类编辑上下文：有 uniqueCode 为编辑，无则新增 */
export interface MerchantCategoryEditContext {
  /** 分类唯一标识（编辑时传） */
  uniqueCode?: string
  /** 初始值 */
  initialValues?: MerchantCategoryFormValues
}
