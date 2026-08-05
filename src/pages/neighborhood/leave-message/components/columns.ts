import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { INeighborhoodLeaveMessage } from '@/services/api/neighborhood-leave-message.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'

import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<INeighborhoodLeaveMessage>[] = [
  SelectColumn as ColumnDef<INeighborhoodLeaveMessage>,
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodLeaveMessage>, { column, title: '姓名' }),
    meta: { title: '姓名' },
    cell: ({ row }) => h('div', { class: 'text-sm font-medium' }, row.getValue('name') || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodLeaveMessage>, { column, title: '手机号' }),
    meta: { title: '手机号' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums text-muted-foreground' }, row.getValue('phone') || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'message',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodLeaveMessage>, { column, title: '留言内容' }),
    meta: { title: '留言内容' },
    cell: ({ row }) => h('div', { class: 'max-w-[320px] truncate text-sm text-muted-foreground' }, row.getValue('message') || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'createTime',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodLeaveMessage>, { column, title: '留言时间' }),
    meta: { title: '留言时间' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums text-muted-foreground' }, row.getValue('createTime') || '-'),
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
