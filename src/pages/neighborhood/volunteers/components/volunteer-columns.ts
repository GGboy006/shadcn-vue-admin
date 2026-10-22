import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { Volunteer } from '@/services/api/neighborhood-resident.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import DataTableRowActions from './volunteer-data-table-row-actions.vue'

function text(value: string | number | null | undefined) {
  const empty = value === null || value === undefined || value === ''
  return h('div', { class: 'max-w-56 truncate text-sm text-muted-foreground', title: empty ? undefined : String(value) }, empty ? '-' : String(value))
}
const statusVariant: Record<number, 'secondary' | 'success' | 'secondary'> = { 2: 'success', 4: 'secondary' }

export const columns: ColumnDef<Volunteer>[] = [
  SelectColumn as ColumnDef<Volunteer>,
  {
    accessorKey: 'userName',
    header: ({ column }) => h(DataTableColumnHeader<Volunteer>, { column, title: '姓名' }),
    meta: { title: '姓名' },
    cell: ({ row }) => h('div', { class: 'max-w-56 truncate text-sm font-medium', title: row.original.userName || undefined }, row.original.userName || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'userPhone',
    header: ({ column }) => h(DataTableColumnHeader<Volunteer>, { column, title: '电话' }),
    meta: { title: '电话' },
    cell: ({ row }) => text(row.original.userPhone),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'businessHours',
    header: ({ column }) => h(DataTableColumnHeader<Volunteer>, { column, title: '服务时间' }),
    meta: { title: '服务时间' },
    cell: ({ row }) => text(row.original.businessHours),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'hours',
    header: ({ column }) => h(DataTableColumnHeader<Volunteer>, { column, title: '累计时长' }),
    meta: { title: '累计时长' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, row.original.hours === null || row.original.hours === undefined ? '-' : String(row.original.hours)),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<Volunteer>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => h(Badge, { variant: statusVariant[row.original.status] ?? 'secondary' }, () => row.original.statusLabel || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'createTime',
    header: ({ column }) => h(DataTableColumnHeader<Volunteer>, { column, title: '创建时间' }),
    meta: { title: '创建时间' },
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
