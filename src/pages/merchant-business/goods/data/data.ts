/** 推荐状态:1=是,2=否 */
export const goodsRecommendConfig: Record<number, { label: string, style: string }> = {
  1: { label: '推荐', style: 'bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-200' },
  2: { label: '普通', style: 'bg-gray-100/30 text-gray-700 dark:text-gray-300 border-gray-200' },
}

/** 启用状态:1=启用,2=禁用 */
export const goodsStatusConfig: Record<number, { label: string, style: string }> = {
  1: { label: '启用', style: 'bg-green-100/30 text-green-900 dark:text-green-200 border-green-200' },
  2: { label: '禁用', style: 'bg-red-100/30 text-red-900 dark:text-red-200 border-red-200' },
}

/** 收费状态:0=收费,1=免费 */
export const goodsChargeConfig: Record<number, { label: string, style: string }> = {
  0: { label: '收费', style: 'bg-orange-100/30 text-orange-900 dark:text-orange-200 border-orange-200' },
  1: { label: '免费', style: 'bg-green-100/30 text-green-900 dark:text-green-200 border-green-200' },
}
