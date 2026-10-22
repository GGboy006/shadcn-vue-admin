import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { PointGoods } from '@/services/api/neighborhood-resident.api'

import { DataTableColumnHeader, DataTableImageCell, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import DataTableRowActions from './point-goods-data-table-row-actions.vue'

const statusVariant: Record<number, 'secondary' | 'success' | 'secondary'> = { 1: 'success', 2: 'secondary' }

export const columns: ColumnDef<PointGoods>[] = [
  SelectColumn as ColumnDef<PointGoods>,
  {
    accessorKey: 'sortOrder',
    header: ({ column }) => h(DataTableColumnHeader<PointGoods>, { column, title: '排序' }),
    meta: { title: '排序' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, row.original.sortOrder === null || row.original.sortOrder === undefined ? '-' : String(row.original.sortOrder)),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<PointGoods>, { column, title: '名称' }),
    meta: { title: '名称' },
    cell: ({ row }) => h('div', { class: 'max-w-56 truncate text-sm font-medium', title: row.original.name || undefined }, row.original.name || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'poster',
    header: ({ column }) => h(DataTableColumnHeader<PointGoods>, { column, title: '图片' }),
    meta: { title: '图片' },
    cell: ({ row }) => h(DataTableImageCell, { src: row.original.poster, alt: row.original.name || '' }),
    enableSorting: false,
    enableHiding: true,
    enableResizing: false,
  },
  {
    accessorKey: 'points',
    header: ({ column }) => h(DataTableColumnHeader<PointGoods>, { column, title: '积分' }),
    meta: { title: '积分' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, row.original.points === null || row.original.points === undefined ? '-' : String(row.original.points)),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'stock',
    header: ({ column }) => h(DataTableColumnHeader<PointGoods>, { column, title: '库存' }),
    meta: { title: '库存' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, row.original.stock === null || row.original.stock === undefined ? '-' : String(row.original.stock)),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<PointGoods>, { column, title: '状态' }),
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
