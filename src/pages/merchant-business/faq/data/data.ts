/** 启用状态映射:1=启用,2=禁用 */
export const faqStatusConfig: Record<number, { label: string, style: string }> = {
  1: { label: '启用', style: 'bg-green-100/30 text-green-900 dark:text-green-200 border-green-200' },
  2: { label: '禁用', style: 'bg-red-100/30 text-red-900 dark:text-red-200 border-red-200' },
}
