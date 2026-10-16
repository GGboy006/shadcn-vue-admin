import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { VillageMember } from '@/services/api/neighborhood-governance.api'

import { DataTableColumnHeader, DataTableImageCell, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import DataTableRowActions from './member-data-table-row-actions.vue'

function text(value: string | number | null | undefined) {
  return h('div', { class: 'text-sm text-muted-foreground' }, value === null || value === undefined || value === '' ? '-' : String(value))
}

export const columns: ColumnDef<VillageMember>[] = [
  SelectColumn as ColumnDef<VillageMember>,
  {
    accessorKey: 'sortOrder',
    header: ({ column }) => h(DataTableColumnHeader<VillageMember>, { column, title: '排序' }),
    meta: { title: '排序' },
    cell: ({ row }) => text(row.original.sortOrder),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'avatar',
    header: ({ column }) => h(DataTableColumnHeader<VillageMember>, { column, title: '照片' }),
    meta: { title: '照片' },
    cell: ({ row }) => h(DataTableImageCell, { src: row.original.avatar, alt: row.original.name, shape: 'circle' }),
    enableSorting: false,
    enableHiding: true,
    enableResizing: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<VillageMember>, { column, title: '姓名' }),
    meta: { title: '姓名' },
    cell: ({ row }) => h('div', { class: 'text-sm font-medium' }, row.original.name || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => h(DataTableColumnHeader<VillageMember>, { column, title: '职务' }),
    meta: { title: '职务' },
    cell: ({ row }) => text(row.original.title),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => h(DataTableColumnHeader<VillageMember>, { column, title: '电话' }),
    meta: { title: '电话' },
    cell: ({ row }) => text(row.original.phone),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<VillageMember>, { column, title: '状态' }),
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
