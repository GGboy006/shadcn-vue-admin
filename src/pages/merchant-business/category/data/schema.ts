import type { ICateVO } from '@/services/api/merchant-business.api'

/** 分类列表行类型(对应文档 2.2 ICateVO) */
export type Category = ICateVO

/** 分类表单值(新增/编辑共用) */
export interface CategoryFormValues {
  /** 分类名称 */
  name: string
  /** 排序 */
  torder?: number
}

/** 分类编辑上下文:有 cateCode 为编辑,无则新增 */
export interface CategoryEditContext {
  /** 分类唯一标识(编辑时传) */
  cateCode?: string
  /** 初始值 */
  initialValues?: CategoryFormValues
}
