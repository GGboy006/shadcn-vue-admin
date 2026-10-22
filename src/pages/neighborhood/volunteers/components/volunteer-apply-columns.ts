import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { Volunteer } from '@/services/api/neighborhood-resident.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import DataTableRowActions from './volunteer-apply-data-table-row-actions.vue'

function text(value: string | number | null | undefined) {
  const empty = value === null || value === undefined || value === ''
  return h('div', { class: 'max-w-56 truncate text-sm text-muted-foreground', title: empty ? undefined : String(value) }, empty ? '-' : String(value))
}
const statusVariant: Record<number, 'destructive' | 'warning' | 'secondary'> = { 1: 'warning', 3: 'destructive' }

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
    accessorKey: 'intro',
    header: ({ column }) => h(DataTableColumnHeader<Volunteer>, { column, title: '简介' }),
    meta: { title: '简介' },
    cell: ({ row }) => text(row.original.intro),
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
    header: ({ column }) => h(DataTableColumnHeader<Volunteer>, { column, title: '报名时间' }),
    meta: { title: '报名时间' },
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
