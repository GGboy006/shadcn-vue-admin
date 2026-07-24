import type { OrderStatusType } from '@/services/api/merchant-business.api'

/** 订单状态配置:2=已完成,3=待付款,4=已退款 */
export const orderStatusConfig: Record<OrderStatusType, { value: OrderStatusType, label: string, style: string }> = {
  2: { value: 2, label: '已完成', style: 'bg-green-100/30 text-green-900 dark:text-green-200 border-green-200' },
  3: { value: 3, label: '待付款', style: 'bg-amber-100/30 text-amber-900 dark:text-amber-200 border-amber-200' },
  4: { value: 4, label: '已退款', style: 'bg-red-100/30 text-red-900 dark:text-red-200 border-red-200' },
}

/** 订单列表顶部 Tab 选项:全部 + 3 种状态 */
export interface OrderStatusTab {
  /** undefined = 全部 */
  value: OrderStatusType | undefined
  label: string
}

export const orderStatusTabs: OrderStatusTab[] = [
  { value: undefined, label: '全部' },
  { value: 2, label: '已完成' },
  { value: 3, label: '待付款' },
  { value: 4, label: '已退款' },
]
