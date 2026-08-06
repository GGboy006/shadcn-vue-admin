import type { ColumnDef, VisibilityState } from '@tanstack/vue-table'

export interface FacetedFilterOption {
  label: string
  value: string
  icon?: Component
}

/** DataTableRowActions 的单个操作项 */
export interface RowActionItem {
  /** 唯一标识,回传给 @action */
  key: string
  label: string
  /** 图标组件,lucide icon */
  icon?: Component
  /** default | destructive(红色 + ⌘⌫ 快捷键) */
  variant?: 'default' | 'destructive'
  disabled?: boolean
}

export interface ServerPagination {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export interface DataTableProps<T> {
  loading?: boolean
  columns: ColumnDef<T, any>[]
  data: T[]
  serverPagination?: ServerPagination
  initialColumnVisibility?: VisibilityState
}
