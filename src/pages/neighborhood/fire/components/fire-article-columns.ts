import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { FireArticle } from '@/services/api/neighborhood-resident.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import DataTableRowActions from './fire-article-data-table-row-actions.vue'

function text(value: string | number | null | undefined) {
  const empty = value === null || value === undefined || value === ''
  return h('div', { class: 'max-w-56 truncate text-sm text-muted-foreground', title: empty ? undefined : String(value) }, empty ? '-' : String(value))
}
const statusVariant: Record<number, 'secondary' | 'success' | 'secondary'> = { 1: 'success', 2: 'secondary' }

export const columns: ColumnDef<FireArticle>[] = [
  SelectColumn as ColumnDef<FireArticle>,
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<FireArticle>, { column, title: '标题' }),
    meta: { title: '标题' },
    cell: ({ row }) => h('div', { class: 'max-w-56 truncate text-sm font-medium', title: row.original.name || undefined }, row.original.name || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'typeLabel',
    header: ({ column }) => h(DataTableColumnHeader<FireArticle>, { column, title: '类型' }),
    meta: { title: '类型' },
    cell: ({ row }) => text(row.original.typeLabel),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'remark',
    header: ({ column }) => h(DataTableColumnHeader<FireArticle>, { column, title: '来源' }),
    meta: { title: '来源' },
    cell: ({ row }) => text(row.original.remark),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<FireArticle>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => h(Badge, { variant: statusVariant[row.original.status] ?? 'secondary' }, () => row.original.statusLabel || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'updateTime',
    header: ({ column }) => h(DataTableColumnHeader<FireArticle>, { column, title: '更新时间' }),
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
