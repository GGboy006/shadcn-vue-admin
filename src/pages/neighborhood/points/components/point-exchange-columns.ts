import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { PointExchange } from '@/services/api/neighborhood-resident.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import DataTableRowActions from './point-exchange-data-table-row-actions.vue'

function text(value: string | number | null | undefined) {
  const empty = value === null || value === undefined || value === ''
  return h('div', { class: 'max-w-56 truncate text-sm text-muted-foreground', title: empty ? undefined : String(value) }, empty ? '-' : String(value))
}
const statusVariant: Record<number, 'success' | 'warning' | 'secondary'> = { 1: 'warning', 2: 'success' }

export const columns: ColumnDef<PointExchange>[] = [
  SelectColumn as ColumnDef<PointExchange>,
  {
    accessorKey: 'userName',
    header: ({ column }) => h(DataTableColumnHeader<PointExchange>, { column, title: '居民' }),
    meta: { title: '居民' },
    cell: ({ row }) => h('div', { class: 'max-w-56 truncate text-sm font-medium', title: row.original.userName || undefined }, row.original.userName || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<PointExchange>, { column, title: '商品' }),
    meta: { title: '商品' },
    cell: ({ row }) => text(row.original.name),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'points',
    header: ({ column }) => h(DataTableColumnHeader<PointExchange>, { column, title: '积分' }),
    meta: { title: '积分' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, row.original.points === null || row.original.points === undefined ? '-' : String(row.original.points)),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<PointExchange>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => h(Badge, { variant: statusVariant[row.original.status] ?? 'secondary' }, () => row.original.statusLabel || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'createTime',
    header: ({ column }) => h(DataTableColumnHeader<PointExchange>, { column, title: '兑换时间' }),
    meta: { title: '兑换时间' },
    cell: ({ row }) => text(row.original.createTime),
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
