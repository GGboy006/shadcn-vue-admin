import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { EnvNews } from '@/services/api/neighborhood-resident.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import DataTableRowActions from './env-news-data-table-row-actions.vue'

function text(value: string | number | null | undefined) {
  const empty = value === null || value === undefined || value === ''
  return h('div', { class: 'max-w-56 truncate text-sm text-muted-foreground', title: empty ? undefined : String(value) }, empty ? '-' : String(value))
}
const statusVariant: Record<number, 'secondary' | 'success' | 'secondary'> = { 1: 'success', 2: 'secondary' }

export const columns: ColumnDef<EnvNews>[] = [
  SelectColumn as ColumnDef<EnvNews>,
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<EnvNews>, { column, title: '标题' }),
    meta: { title: '标题' },
    cell: ({ row }) => h('div', { class: 'max-w-56 truncate text-sm font-medium', title: row.original.name || undefined }, row.original.name || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'describes',
    header: ({ column }) => h(DataTableColumnHeader<EnvNews>, { column, title: '摘要' }),
    meta: { title: '摘要' },
    cell: ({ row }) => text(row.original.describes),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'signDate',
    header: ({ column }) => h(DataTableColumnHeader<EnvNews>, { column, title: '日期' }),
    meta: { title: '日期' },
    cell: ({ row }) => text(row.original.signDate),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<EnvNews>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => h(Badge, { variant: statusVariant[row.original.status] ?? 'secondary' }, () => row.original.statusLabel || '-'),
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
