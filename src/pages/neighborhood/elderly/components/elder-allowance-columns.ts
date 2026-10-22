import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { ElderAllowance } from '@/services/api/neighborhood-resident.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'

import DataTableRowActions from './elder-allowance-data-table-row-actions.vue'

function money(value: number | null | undefined) {
  if (value === null || value === undefined)
    return h('div', { class: 'text-sm text-muted-foreground' }, '-')
  return h('div', { class: 'text-sm tabular-nums' }, Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
}

export const columns: ColumnDef<ElderAllowance>[] = [
  SelectColumn as ColumnDef<ElderAllowance>,
  {
    accessorKey: 'sortOrder',
    header: ({ column }) => h(DataTableColumnHeader<ElderAllowance>, { column, title: '排序' }),
    meta: { title: '排序' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, row.original.sortOrder === null || row.original.sortOrder === undefined ? '-' : String(row.original.sortOrder)),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<ElderAllowance>, { column, title: '名称' }),
    meta: { title: '名称' },
    cell: ({ row }) => h('div', { class: 'max-w-56 truncate text-sm font-medium', title: row.original.name || undefined }, row.original.name || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'salePrice',
    header: ({ column }) => h(DataTableColumnHeader<ElderAllowance>, { column, title: '每月补贴' }),
    meta: { title: '每月补贴' },
    cell: ({ row }) => money(row.original.salePrice),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'shouldCount',
    header: ({ column }) => h(DataTableColumnHeader<ElderAllowance>, { column, title: '人数' }),
    meta: { title: '人数' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, row.original.shouldCount === null || row.original.shouldCount === undefined ? '-' : String(row.original.shouldCount)),
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
