import type { IActivityCateAddReq, IActivityCateUpdateReq } from '@/services/api/merchant-business.api'

import type { ActivityCateFormValues } from './schema'

/**
 * 构建活动分类新增/更新请求体。
 *
 * - 有 cateCode -> 更新(IActivityCateUpdateReq)
 * - 无 cateCode -> 新增(IActivityCateAddReq)
 * - torder 为 undefined 时不写入字段(后端不更新)
 * - name 为空抛错(表单校验兜底)
 */
export function buildActivityCatePayload(values: ActivityCateFormValues, cateCode?: string): IActivityCateAddReq | IActivityCateUpdateReq {
  if (!values.name.trim()) {
    throw new Error('分类名称不能为空')
  }

  const base = {
    name: values.name,
    ...(values.torder !== undefined ? { torder: values.torder } : {}),
  }

  if (cateCode) {
    return { cateCode, ...base } as IActivityCateUpdateReq
  }
  return base as IActivityCateAddReq
}
