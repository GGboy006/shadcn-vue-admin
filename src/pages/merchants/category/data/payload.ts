import type { IMerchantCategoryAddDTO, IMerchantCategoryUpdateDTO } from '@/services/api/merchant.api'

import type { MerchantCategoryFormValues } from './schema'

/**
 * 构建商户分类新增/更新请求体。
 *
 * - 有 uniqueCode -> 更新（IMerchantCategoryUpdateDTO）
 * - 无 uniqueCode -> 新增（IMerchantCategoryAddDTO）
 * - torder/status 为 undefined 时不写入字段（后端不更新）
 */
export function buildMerchantCategoryPayload(values: MerchantCategoryFormValues, uniqueCode?: string): IMerchantCategoryAddDTO | IMerchantCategoryUpdateDTO {
  if (!values.name.trim()) {
    throw new Error('分类名称不能为空')
  }

  const base = {
    name: values.name,
    ...(values.torder !== undefined ? { torder: values.torder } : {}),
    ...(values.status !== undefined ? { status: values.status } : {}),
  }

  if (uniqueCode) {
    return { uniqueCode, ...base } as IMerchantCategoryUpdateDTO
  }
  return base as IMerchantCategoryAddDTO
}
