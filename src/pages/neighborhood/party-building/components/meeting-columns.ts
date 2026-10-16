import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { PartyMeeting } from '@/services/api/neighborhood-governance.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import DataTableRowActions from './meeting-data-table-row-actions.vue'

function text(value: string | number | null | undefined) {
  return h('div', { class: 'text-sm text-muted-foreground' }, value === null || value === undefined || value === '' ? '-' : String(value))
}

export const columns: ColumnDef<PartyMeeting>[] = [
  SelectColumn as ColumnDef<PartyMeeting>,
  {
    accessorKey: 'typeLabel',
    header: ({ column }) => h(DataTableColumnHeader<PartyMeeting>, { column, title: '类型' }),
    meta: { title: '类型' },
    cell: ({ row }) => text(row.original.typeLabel),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<PartyMeeting>, { column, title: '主题' }),
    meta: { title: '主题' },
    cell: ({ row }) => h('div', { class: 'text-sm font-medium' }, row.original.name || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'startTime',
    header: ({ column }) => h(DataTableColumnHeader<PartyMeeting>, { column, title: '时间' }),
    meta: { title: '时间' },
    cell: ({ row }) => text(row.original.startTime),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'address',
    header: ({ column }) => h(DataTableColumnHeader<PartyMeeting>, { column, title: '地点' }),
    meta: { title: '地点' },
    cell: ({ row }) => text(row.original.address),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<PartyMeeting>, { column, title: '状态' }),
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
