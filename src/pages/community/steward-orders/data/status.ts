import type {
  HousekeeperAssignMode,
  HousekeeperCancelBy,
  HousekeeperEvaluatorType,
  HousekeeperOperatorType,
  HousekeeperOrderPayStatus,
  HousekeeperOrderStatus,
  HousekeeperPayChannel,
  HousekeeperPaymentPayStatus,
  HousekeeperPaymentScene,
} from '@/services/api/housekeeper-order.api'

/** 订单状态筛选项(文案对齐文档 §9;列表展示优先用接口 Label) */
export const housekeeperOrderStatusFilterOptions: { value: HousekeeperOrderStatus, label: string }[] = [
  { value: 0, label: '待接单' },
  { value: 1, label: '已接单' },
  { value: 2, label: '服务中' },
  { value: 3, label: '待确认' },
  { value: 4, label: '已完成' },
  { value: 5, label: '已取消' },
  { value: 6, label: '已拒单' },
]

/** 订单支付状态筛选项(文案对齐文档 §9) */
export const housekeeperOrderPayStatusFilterOptions: { value: HousekeeperOrderPayStatus, label: string }[] = [
  { value: 0, label: '未支付' },
  { value: 1, label: '支付中' },
  { value: 2, label: '已支付' },
  { value: 3, label: '已退款' },
  { value: 4, label: '部分退款' },
]

export const housekeeperOrderStatusStyle: Record<HousekeeperOrderStatus, string> = {
  0: 'bg-amber-100/30 text-amber-900 dark:text-amber-200 border-amber-200',
  1: 'bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-200',
  2: 'bg-cyan-100/30 text-cyan-900 dark:text-cyan-200 border-cyan-200',
  3: 'bg-violet-100/30 text-violet-900 dark:text-violet-200 border-violet-200',
  4: 'bg-green-100/30 text-green-900 dark:text-green-200 border-green-200',
  5: 'bg-red-100/30 text-red-900 dark:text-red-200 border-red-200',
  6: 'bg-muted text-muted-foreground border-muted-foreground/20',
}

export const housekeeperOrderPayStatusStyle: Record<HousekeeperOrderPayStatus, string> = {
  0: 'bg-muted text-muted-foreground border-muted-foreground/20',
  1: 'bg-amber-100/30 text-amber-900 dark:text-amber-200 border-amber-200',
  2: 'bg-green-100/30 text-green-900 dark:text-green-200 border-green-200',
  3: 'bg-red-100/30 text-red-900 dark:text-red-200 border-red-200',
  4: 'bg-orange-100/30 text-orange-900 dark:text-orange-200 border-orange-200',
}

/** 支付流水状态色(对接文档 §11,与订单 payStatus 不是同一套) */
export const housekeeperPaymentPayStatusStyle: Record<HousekeeperPaymentPayStatus, string> = {
  0: 'bg-muted text-muted-foreground border-muted-foreground/20',
  1: 'bg-amber-100/30 text-amber-900 dark:text-amber-200 border-amber-200',
  2: 'bg-green-100/30 text-green-900 dark:text-green-200 border-green-200',
  3: 'bg-red-100/30 text-red-900 dark:text-red-200 border-red-200',
  4: 'bg-muted text-muted-foreground border-muted-foreground/20',
  5: 'bg-orange-100/30 text-orange-900 dark:text-orange-200 border-orange-200',
}

export const housekeeperAssignModeLabel: Record<HousekeeperAssignMode, string> = {
  1: '到人指定',
  2: '整馆派单',
}

export const housekeeperPayChannelLabel: Record<HousekeeperPayChannel, string> = {
  1: '微信',
  2: '支付宝',
}

export const housekeeperPaymentSceneLabel: Record<HousekeeperPaymentScene, string> = {
  1: '订单预付',
  2: '履约尾款',
  3: '履约进度款',
}

export const housekeeperPaymentPayStatusLabel: Record<HousekeeperPaymentPayStatus, string> = {
  0: '待支付',
  1: '支付中',
  2: '成功',
  3: '失败',
  4: '已关闭',
  5: '已退款',
}

export const housekeeperEvaluatorTypeLabel: Record<HousekeeperEvaluatorType, string> = {
  1: '居民评价师傅',
  2: '师傅评价居民',
}

export const housekeeperOperatorTypeLabel: Record<HousekeeperOperatorType, string> = {
  1: '居民',
  2: '师傅',
  3: '站长',
  4: '系统',
}

export const housekeeperCancelByLabel: Record<HousekeeperCancelBy, string> = {
  1: '居民',
  2: '师傅',
  3: '系统或站长',
}

export function orderStatusText(status?: number | null, label?: string | null): string {
  if (label)
    return label
  if (status == null)
    return '-'
  return housekeeperOrderStatusFilterOptions.find(item => item.value === status)?.label ?? String(status)
}
