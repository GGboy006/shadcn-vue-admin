/** 活动审核状态:0=待审核,1=审核通过,2=审核未通过 */
export const activityAuditConfig: Record<number, { label: string, style: string }> = {
  0: { label: '待审核', style: 'bg-amber-100/30 text-amber-900 dark:text-amber-200 border-amber-200' },
  1: { label: '审核通过', style: 'bg-green-100/30 text-green-900 dark:text-green-200 border-green-200' },
  2: { label: '审核未通过', style: 'bg-red-100/30 text-red-900 dark:text-red-200 border-red-200' },
}

/** 收费状态:1=收费,2=免费 */
export const activityChargeConfig: Record<number, { label: string, style: string }> = {
  1: { label: '收费', style: 'bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-200' },
  2: { label: '免费', style: 'bg-gray-100/30 text-gray-700 dark:text-gray-300 border-gray-200' },
}

/** 推荐:1=是,2=否 */
export const activityRecommendConfig: Record<number, { label: string, style: string }> = {
  1: { label: '推荐', style: 'bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-200' },
  2: { label: '普通', style: 'bg-gray-100/30 text-gray-700 dark:text-gray-300 border-gray-200' },
}

/** 启用状态:1=启用,2=禁用 */
export const activityStatusConfig: Record<number, { label: string, style: string }> = {
  1: { label: '启用', style: 'bg-green-100/30 text-green-900 dark:text-green-200 border-green-200' },
  2: { label: '禁用', style: 'bg-red-100/30 text-red-900 dark:text-red-200 border-red-200' },
}
