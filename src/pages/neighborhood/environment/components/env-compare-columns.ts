import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { EnvCompare } from '@/services/api/neighborhood-resident.api'

import { DataTableColumnHeader, DataTableImageCell, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import DataTableRowActions from './env-compare-data-table-row-actions.vue'

function text(value: string | number | null | undefined) {
  const empty = value === null || value === undefined || value === ''
  return h('div', { class: 'max-w-56 truncate text-sm text-muted-foreground', title: empty ? undefined : String(value) }, empty ? '-' : String(value))
}
const statusVariant: Record<number, 'info' | 'success' | 'secondary'> = { 1: 'info', 2: 'success' }

export const columns: ColumnDef<EnvCompare>[] = [
  SelectColumn as ColumnDef<EnvCompare>,
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<EnvCompare>, { column, title: '项目' }),
    meta: { title: '项目' },
    cell: ({ row }) => h('div', { class: 'max-w-56 truncate text-sm font-medium', title: row.original.name || undefined }, row.original.name || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'address',
    header: ({ column }) => h(DataTableColumnHeader<EnvCompare>, { column, title: '位置' }),
    meta: { title: '位置' },
    cell: ({ row }) => text(row.original.address),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'poster',
    header: ({ column }) => h(DataTableColumnHeader<EnvCompare>, { column, title: '整改前' }),
    meta: { title: '整改前' },
    cell: ({ row }) => h(DataTableImageCell, { src: row.original.poster, alt: row.original.name || '' }),
    enableSorting: false,
    enableHiding: true,
    enableResizing: false,
  },
  {
    accessorKey: 'logo',
    header: ({ column }) => h(DataTableColumnHeader<EnvCompare>, { column, title: '整改后' }),
    meta: { title: '整改后' },
    cell: ({ row }) => h(DataTableImageCell, { src: row.original.logo, alt: row.original.name || '' }),
    enableSorting: false,
    enableHiding: true,
    enableResizing: false,
  },
  {
    accessorKey: 'signDate',
    header: ({ column }) => h(DataTableColumnHeader<EnvCompare>, { column, title: '日期' }),
    meta: { title: '日期' },
    cell: ({ row }) => text(row.original.signDate),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<EnvCompare>, { column, title: '状态' }),
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
