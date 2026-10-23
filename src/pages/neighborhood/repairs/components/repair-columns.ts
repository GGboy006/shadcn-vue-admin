import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { RepairOrder } from '@/services/api/neighborhood-resident.api'

import { DataTableColumnHeader, DataTableImageCell, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import DataTableRowActions from './repair-data-table-row-actions.vue'

function text(value: string | number | null | undefined) {
  const empty = value === null || value === undefined || value === ''
  return h('div', { class: 'max-w-56 truncate text-sm text-muted-foreground', title: empty ? undefined : String(value) }, empty ? '-' : String(value))
}
const statusVariant: Record<number, 'info' | 'success' | 'warning' | 'secondary'> = { 1: 'warning', 2: 'info', 3: 'success' }

export const columns: ColumnDef<RepairOrder>[] = [
  SelectColumn as ColumnDef<RepairOrder>,
  {
    accessorKey: 'code',
    header: ({ column }) => h(DataTableColumnHeader<RepairOrder>, { column, title: '单号' }),
    meta: { title: '单号' },
    cell: ({ row }) => text(row.original.code),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'typeLabel',
    header: ({ column }) => h(DataTableColumnHeader<RepairOrder>, { column, title: '类型' }),
    meta: { title: '类型' },
    cell: ({ row }) => text(row.original.typeLabel),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<RepairOrder>, { column, title: '标题' }),
    meta: { title: '标题' },
    cell: ({ row }) => h('div', { class: 'max-w-56 truncate text-sm font-medium', title: row.original.name || undefined }, row.original.name || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'userName',
    header: ({ column }) => h(DataTableColumnHeader<RepairOrder>, { column, title: '报修人' }),
    meta: { title: '报修人' },
    cell: ({ row }) => text(row.original.userName),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'contactName',
    header: ({ column }) => h(DataTableColumnHeader<RepairOrder>, { column, title: '网格员' }),
    meta: { title: '网格员' },
    cell: ({ row }) => text(row.original.contactName),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'address',
    header: ({ column }) => h(DataTableColumnHeader<RepairOrder>, { column, title: '地点' }),
    meta: { title: '地点' },
    cell: ({ row }) => text(row.original.address),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<RepairOrder>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => h(Badge, { variant: statusVariant[row.original.status] ?? 'secondary' }, () => row.original.statusLabel || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'createTime',
    header: ({ column }) => h(DataTableColumnHeader<RepairOrder>, { column, title: '上报时间' }),
    meta: { title: '上报时间' },
    cell: ({ row }) => text(row.original.createTime),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'poster',
    header: ({ column }) => h(DataTableColumnHeader<RepairOrder>, { column, title: '照片' }),
    meta: { title: '照片' },
    cell: ({ row }) => h(DataTableImageCell, { src: row.original.poster, alt: row.original.name || '' }),
    enableSorting: false,
    enableHiding: true,
    enableResizing: false,
  },
  {
    id: 'actions',
    cell: ({ row }) => h(DataTableRowActions, { row }),
    enableHiding: false,
  },
]
