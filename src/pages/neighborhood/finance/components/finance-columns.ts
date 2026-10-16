import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { FinanceLedger } from '@/services/api/neighborhood-governance.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import DataTableRowActions from './finance-data-table-row-actions.vue'

function money(value: number) {
  return Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function amount(value: number) {
  return h('div', { class: 'text-sm tabular-nums' }, money(value))
}

export const columns: ColumnDef<FinanceLedger>[] = [
  SelectColumn as ColumnDef<FinanceLedger>,
  {
    accessorKey: 'month',
    header: ({ column }) => h(DataTableColumnHeader<FinanceLedger>, { column, title: '所属月份' }),
    meta: { title: '所属月份' },
    cell: ({ row }) => h('div', { class: 'text-sm font-medium' }, row.original.month || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'income',
    header: ({ column }) => h(DataTableColumnHeader<FinanceLedger>, { column, title: '收入合计' }),
    meta: { title: '收入合计' },
    cell: ({ row }) => amount(row.original.income),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'expense',
    header: ({ column }) => h(DataTableColumnHeader<FinanceLedger>, { column, title: '支出合计' }),
    meta: { title: '支出合计' },
    cell: ({ row }) => amount(row.original.expense),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'balance',
    header: ({ column }) => h(DataTableColumnHeader<FinanceLedger>, { column, title: '结余' }),
    meta: { title: '结余' },
    cell: ({ row }) => amount(row.original.balance),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<FinanceLedger>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => h(Badge, { variant: row.original.status === 1 ? 'success' : 'secondary' }, () => row.original.statusLabel || (row.original.status === 1 ? '公示中' : '已归档')),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => h(DataTableRowActions, { row }),
    enableHiding: false,
  },
]
