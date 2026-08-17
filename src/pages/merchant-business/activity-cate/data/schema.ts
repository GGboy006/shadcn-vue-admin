import type { IActivityCateVO } from '@/services/api/merchant-business.api'

/** 活动分类列表行类型(对应文档 4.2 IActivityCateVO) */
export type ActivityCate = IActivityCateVO

/** 活动分类表单值(新增/编辑共用) */
export interface ActivityCateFormValues {
  /** 分类名称 */
  name: string
  /** 排序 */
  torder?: number
}

/** 活动分类编辑上下文:有 cateCode 为编辑,无则新增 */
export interface ActivityCateEditContext {
  /** 分类唯一标识(编辑时传) */
  cateCode?: string
  /** 初始值 */
  initialValues?: ActivityCateFormValues
}
