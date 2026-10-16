import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { VillageStat } from '@/services/api/neighborhood-governance.api'

import { DataTableColumnHeader, DataTableImageCell, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import DataTableRowActions from './stat-data-table-row-actions.vue'

function text(value: string | number | null | undefined) {
  return h('div', { class: 'text-sm text-muted-foreground' }, value === null || value === undefined || value === '' ? '-' : String(value))
}

export const columns: ColumnDef<VillageStat>[] = [
  SelectColumn as ColumnDef<VillageStat>,
  {
    accessorKey: 'sortOrder',
    header: ({ column }) => h(DataTableColumnHeader<VillageStat>, { column, title: '排序' }),
    meta: { title: '排序' },
    cell: ({ row }) => text(row.original.sortOrder),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'icon',
    header: ({ column }) => h(DataTableColumnHeader<VillageStat>, { column, title: '图标' }),
    meta: { title: '图标' },
    cell: ({ row }) => h(DataTableImageCell, { src: row.original.icon, alt: row.original.statName }),
    enableSorting: false,
    enableHiding: true,
    enableResizing: false,
  },
  {
    accessorKey: 'statName',
    header: ({ column }) => h(DataTableColumnHeader<VillageStat>, { column, title: '指标名称' }),
    meta: { title: '指标名称' },
    cell: ({ row }) => h('div', { class: 'text-sm font-medium' }, row.original.statName || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'statCode',
    header: ({ column }) => h(DataTableColumnHeader<VillageStat>, { column, title: '编码' }),
    meta: { title: '编码' },
    cell: ({ row }) => text(row.original.statCode),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'statValue',
    header: ({ column }) => h(DataTableColumnHeader<VillageStat>, { column, title: '数值' }),
    meta: { title: '数值' },
    cell: ({ row }) => text(`${row.original.statValue || '-'}${row.original.unit ? ` ${row.original.unit}` : ''}`),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<VillageStat>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => h(Badge, { variant: row.original.status === 1 ? 'success' : 'secondary' }, () => row.original.statusLabel || (row.original.status === 1 ? '启用' : '禁用')),
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
