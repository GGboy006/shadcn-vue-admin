import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { MailMessage } from '@/services/api/neighborhood-resident.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import DataTableRowActions from './mail-data-table-row-actions.vue'

function text(value: string | number | null | undefined) {
  const empty = value === null || value === undefined || value === ''
  return h('div', { class: 'max-w-56 truncate text-sm text-muted-foreground', title: empty ? undefined : String(value) }, empty ? '-' : String(value))
}
const showStatusVariant: Record<number, 'secondary' | 'success' | 'secondary'> = { 1: 'success', 2: 'secondary' }
const statusVariant: Record<number, 'info' | 'success' | 'warning' | 'secondary'> = { 1: 'warning', 2: 'info', 3: 'success' }

export const columns: ColumnDef<MailMessage>[] = [
  SelectColumn as ColumnDef<MailMessage>,
  {
    accessorKey: 'code',
    header: ({ column }) => h(DataTableColumnHeader<MailMessage>, { column, title: '单号' }),
    meta: { title: '单号' },
    cell: ({ row }) => text(row.original.code),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<MailMessage>, { column, title: '标题' }),
    meta: { title: '标题' },
    cell: ({ row }) => h('div', { class: 'max-w-56 truncate text-sm font-medium', title: row.original.name || undefined }, row.original.name || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'userName',
    header: ({ column }) => h(DataTableColumnHeader<MailMessage>, { column, title: '来信人' }),
    meta: { title: '来信人' },
    cell: ({ row }) => text(row.original.userName),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'showStatus',
    header: ({ column }) => h(DataTableColumnHeader<MailMessage>, { column, title: '公开' }),
    meta: { title: '公开' },
    cell: ({ row }) => h(Badge, { variant: showStatusVariant[row.original.showStatus] ?? 'secondary' }, () => row.original.showStatusLabel || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<MailMessage>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => h(Badge, { variant: statusVariant[row.original.status] ?? 'secondary' }, () => row.original.statusLabel || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'createTime',
    header: ({ column }) => h(DataTableColumnHeader<MailMessage>, { column, title: '来信时间' }),
    meta: { title: '来信时间' },
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
