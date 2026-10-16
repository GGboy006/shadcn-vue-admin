import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { PartyPublicity } from '@/services/api/neighborhood-governance.api'

import { DataTableColumnHeader, DataTableImageCell, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import DataTableRowActions from './publicity-data-table-row-actions.vue'

function text(value: string | number | null | undefined) {
  return h('div', { class: 'text-sm text-muted-foreground' }, value === null || value === undefined || value === '' ? '-' : String(value))
}

export const columns: ColumnDef<PartyPublicity>[] = [
  SelectColumn as ColumnDef<PartyPublicity>,
  {
    accessorKey: 'avatar',
    header: ({ column }) => h(DataTableColumnHeader<PartyPublicity>, { column, title: '照片' }),
    meta: { title: '照片' },
    cell: ({ row }) => h(DataTableImageCell, { src: row.original.avatar, alt: row.original.name, shape: 'circle' }),
    enableSorting: false,
    enableHiding: true,
    enableResizing: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<PartyPublicity>, { column, title: '姓名' }),
    meta: { title: '姓名' },
    cell: ({ row }) => h('div', { class: 'text-sm font-medium' }, row.original.name || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'typeLabel',
    header: ({ column }) => h(DataTableColumnHeader<PartyPublicity>, { column, title: '类型' }),
    meta: { title: '类型' },
    cell: ({ row }) => text(row.original.typeLabel),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'signDate',
    header: ({ column }) => h(DataTableColumnHeader<PartyPublicity>, { column, title: '确定日期' }),
    meta: { title: '确定日期' },
    cell: ({ row }) => text(row.original.signDate),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    id: 'period',
    header: ({ column }) => h(DataTableColumnHeader<PartyPublicity>, { column, title: '公示起止' }),
    meta: { title: '公示起止' },
    cell: ({ row }) => text([row.original.startTime, row.original.endTime].filter(Boolean).join(' ~ ')),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<PartyPublicity>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => h(Badge, { variant: row.original.status === 1 ? 'success' : 'secondary' }, () => row.original.statusLabel || '-'),
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
