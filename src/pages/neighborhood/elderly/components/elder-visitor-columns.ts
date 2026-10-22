import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { ElderVisitor } from '@/services/api/neighborhood-resident.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'

import DataTableRowActions from './elder-visitor-data-table-row-actions.vue'

function text(value: string | number | null | undefined) {
  const empty = value === null || value === undefined || value === ''
  return h('div', { class: 'max-w-56 truncate text-sm text-muted-foreground', title: empty ? undefined : String(value) }, empty ? '-' : String(value))
}

export const columns: ColumnDef<ElderVisitor>[] = [
  SelectColumn as ColumnDef<ElderVisitor>,
  {
    accessorKey: 'sortOrder',
    header: ({ column }) => h(DataTableColumnHeader<ElderVisitor>, { column, title: '排序' }),
    meta: { title: '排序' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, row.original.sortOrder === null || row.original.sortOrder === undefined ? '-' : String(row.original.sortOrder)),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<ElderVisitor>, { column, title: '姓名' }),
    meta: { title: '姓名' },
    cell: ({ row }) => h('div', { class: 'max-w-56 truncate text-sm font-medium', title: row.original.name || undefined }, row.original.name || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => h(DataTableColumnHeader<ElderVisitor>, { column, title: '电话' }),
    meta: { title: '电话' },
    cell: ({ row }) => text(row.original.phone),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'remark',
    header: ({ column }) => h(DataTableColumnHeader<ElderVisitor>, { column, title: '备注' }),
    meta: { title: '备注' },
    cell: ({ row }) => text(row.original.remark),
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
