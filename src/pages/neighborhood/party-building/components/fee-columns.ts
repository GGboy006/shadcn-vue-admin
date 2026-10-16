import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { PartyFee } from '@/services/api/neighborhood-governance.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import DataTableRowActions from './fee-data-table-row-actions.vue'

function money(value: number) {
  return Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function text(value: string | number | null | undefined) {
  return h('div', { class: 'text-sm text-muted-foreground' }, value === null || value === undefined || value === '' ? '-' : String(value))
}

export const columns: ColumnDef<PartyFee>[] = [
  SelectColumn as ColumnDef<PartyFee>,
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<PartyFee>, { column, title: '季度' }),
    meta: { title: '季度' },
    cell: ({ row }) => h('div', { class: 'text-sm font-medium' }, row.original.name || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'shouldCount',
    header: ({ column }) => h(DataTableColumnHeader<PartyFee>, { column, title: '应缴人数' }),
    meta: { title: '应缴人数' },
    cell: ({ row }) => text(row.original.shouldCount),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'paidCount',
    header: ({ column }) => h(DataTableColumnHeader<PartyFee>, { column, title: '实缴人数' }),
    meta: { title: '实缴人数' },
    cell: ({ row }) => text(row.original.paidCount),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'feeRate',
    header: ({ column }) => h(DataTableColumnHeader<PartyFee>, { column, title: '比例' }),
    meta: { title: '比例' },
    cell: ({ row }) => text(`${row.original.feeRate}%`),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'salePrice',
    header: ({ column }) => h(DataTableColumnHeader<PartyFee>, { column, title: '总额' }),
    meta: { title: '总额' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, money(row.original.salePrice)),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<PartyFee>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => h(Badge, { variant: row.original.status === 2 ? 'success' : 'warning' }, () => row.original.statusLabel || '-'),
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
