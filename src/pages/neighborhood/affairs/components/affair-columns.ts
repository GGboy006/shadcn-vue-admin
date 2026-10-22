import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { Affair } from '@/services/api/neighborhood-resident.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import DataTableRowActions from './affair-data-table-row-actions.vue'

function text(value: string | number | null | undefined) {
  const empty = value === null || value === undefined || value === ''
  return h('div', { class: 'max-w-56 truncate text-sm text-muted-foreground', title: empty ? undefined : String(value) }, empty ? '-' : String(value))
}
const statusVariant: Record<number, 'info' | 'secondary' | 'success' | 'warning' | 'secondary'> = { 1: 'warning', 2: 'info', 3: 'info', 4: 'warning', 5: 'success', 6: 'secondary' }

export const columns: ColumnDef<Affair>[] = [
  SelectColumn as ColumnDef<Affair>,
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<Affair>, { column, title: '标题' }),
    meta: { title: '标题' },
    cell: ({ row }) => h('div', { class: 'max-w-56 truncate text-sm font-medium', title: row.original.name || undefined }, row.original.name || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'typeLabel',
    header: ({ column }) => h(DataTableColumnHeader<Affair>, { column, title: '类型' }),
    meta: { title: '类型' },
    cell: ({ row }) => text(row.original.typeLabel),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'userName',
    header: ({ column }) => h(DataTableColumnHeader<Affair>, { column, title: '发起人' }),
    meta: { title: '发起人' },
    cell: ({ row }) => text(row.original.userName),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<Affair>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => h(Badge, { variant: statusVariant[row.original.status] ?? 'secondary' }, () => row.original.statusLabel || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'supportCount',
    header: ({ column }) => h(DataTableColumnHeader<Affair>, { column, title: '支持' }),
    meta: { title: '支持' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, row.original.supportCount === null || row.original.supportCount === undefined ? '-' : String(row.original.supportCount)),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'commentCount',
    header: ({ column }) => h(DataTableColumnHeader<Affair>, { column, title: '评论' }),
    meta: { title: '评论' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, row.original.commentCount === null || row.original.commentCount === undefined ? '-' : String(row.original.commentCount)),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'endTime',
    header: ({ column }) => h(DataTableColumnHeader<Affair>, { column, title: '截止时间' }),
    meta: { title: '截止时间' },
    cell: ({ row }) => text(row.original.endTime),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'createTime',
    header: ({ column }) => h(DataTableColumnHeader<Affair>, { column, title: '创建时间' }),
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
