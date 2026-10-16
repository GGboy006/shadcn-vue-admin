import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { PartyActivity } from '@/services/api/neighborhood-governance.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import DataTableRowActions from './activity-data-table-row-actions.vue'

function text(value: string | number | null | undefined) {
  return h('div', { class: 'text-sm text-muted-foreground' }, value === null || value === undefined || value === '' ? '-' : String(value))
}

function statusVariant(status: number) {
  if (status === 3)
    return 'success' as const
  if (status === 2)
    return 'info' as const
  return 'warning' as const
}

export const columns: ColumnDef<PartyActivity>[] = [
  SelectColumn as ColumnDef<PartyActivity>,
  {
    accessorKey: 'sortOrder',
    header: ({ column }) => h(DataTableColumnHeader<PartyActivity>, { column, title: '排序' }),
    meta: { title: '排序' },
    cell: ({ row }) => text(row.original.sortOrder),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<PartyActivity>, { column, title: '活动名称' }),
    meta: { title: '活动名称' },
    cell: ({ row }) => h('div', { class: 'text-sm font-medium' }, row.original.name || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'describes',
    header: ({ column }) => h(DataTableColumnHeader<PartyActivity>, { column, title: '说明' }),
    meta: { title: '说明' },
    cell: ({ row }) => text(row.original.describes),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<PartyActivity>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => h(Badge, { variant: statusVariant(row.original.status) }, () => row.original.statusLabel || '-'),
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
