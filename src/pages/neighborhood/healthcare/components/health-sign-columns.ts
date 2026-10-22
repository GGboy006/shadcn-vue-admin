import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { HealthSign } from '@/services/api/neighborhood-resident.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import DataTableRowActions from './health-sign-data-table-row-actions.vue'

function text(value: string | number | null | undefined) {
  const empty = value === null || value === undefined || value === ''
  return h('div', { class: 'max-w-56 truncate text-sm text-muted-foreground', title: empty ? undefined : String(value) }, empty ? '-' : String(value))
}
const statusVariant: Record<number, 'secondary' | 'success' | 'warning' | 'secondary'> = { 1: 'success', 2: 'warning', 3: 'secondary' }

export const columns: ColumnDef<HealthSign>[] = [
  SelectColumn as ColumnDef<HealthSign>,
  {
    accessorKey: 'userName',
    header: ({ column }) => h(DataTableColumnHeader<HealthSign>, { column, title: '姓名' }),
    meta: { title: '姓名' },
    cell: ({ row }) => h('div', { class: 'max-w-56 truncate text-sm font-medium', title: row.original.userName || undefined }, row.original.userName || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'contactName',
    header: ({ column }) => h(DataTableColumnHeader<HealthSign>, { column, title: '家庭医生' }),
    meta: { title: '家庭医生' },
    cell: ({ row }) => text(row.original.contactName),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => h(DataTableColumnHeader<HealthSign>, { column, title: '职称' }),
    meta: { title: '职称' },
    cell: ({ row }) => text(row.original.title),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'signDate',
    header: ({ column }) => h(DataTableColumnHeader<HealthSign>, { column, title: '签约日期' }),
    meta: { title: '签约日期' },
    cell: ({ row }) => text(row.original.signDate),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'endTime',
    header: ({ column }) => h(DataTableColumnHeader<HealthSign>, { column, title: '到期时间' }),
    meta: { title: '到期时间' },
    cell: ({ row }) => text(row.original.endTime),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<HealthSign>, { column, title: '状态' }),
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
