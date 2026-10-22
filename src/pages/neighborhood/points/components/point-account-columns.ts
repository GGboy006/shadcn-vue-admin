import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { PointAccount } from '@/services/api/neighborhood-resident.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'

import DataTableRowActions from './point-account-data-table-row-actions.vue'

function text(value: string | number | null | undefined) {
  const empty = value === null || value === undefined || value === ''
  return h('div', { class: 'max-w-56 truncate text-sm text-muted-foreground', title: empty ? undefined : String(value) }, empty ? '-' : String(value))
}

export const columns: ColumnDef<PointAccount>[] = [
  SelectColumn as ColumnDef<PointAccount>,
  {
    accessorKey: 'userName',
    header: ({ column }) => h(DataTableColumnHeader<PointAccount>, { column, title: '姓名' }),
    meta: { title: '姓名' },
    cell: ({ row }) => h('div', { class: 'max-w-56 truncate text-sm font-medium', title: row.original.userName || undefined }, row.original.userName || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'address',
    header: ({ column }) => h(DataTableColumnHeader<PointAccount>, { column, title: '地址' }),
    meta: { title: '地址' },
    cell: ({ row }) => text(row.original.address),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'balance',
    header: ({ column }) => h(DataTableColumnHeader<PointAccount>, { column, title: '余额' }),
    meta: { title: '余额' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, row.original.balance === null || row.original.balance === undefined ? '-' : String(row.original.balance)),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'earned',
    header: ({ column }) => h(DataTableColumnHeader<PointAccount>, { column, title: '累计获得' }),
    meta: { title: '累计获得' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, row.original.earned === null || row.original.earned === undefined ? '-' : String(row.original.earned)),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'spent',
    header: ({ column }) => h(DataTableColumnHeader<PointAccount>, { column, title: '累计消耗' }),
    meta: { title: '累计消耗' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, row.original.spent === null || row.original.spent === undefined ? '-' : String(row.original.spent)),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'updateTime',
    header: ({ column }) => h(DataTableColumnHeader<PointAccount>, { column, title: '更新时间' }),
    meta: { title: '更新时间' },
    cell: ({ row }) => text(row.original.updateTime),
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
