import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { ElderVisit } from '@/services/api/neighborhood-resident.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import DataTableRowActions from './elder-visit-data-table-row-actions.vue'

function text(value: string | number | null | undefined) {
  const empty = value === null || value === undefined || value === ''
  return h('div', { class: 'max-w-56 truncate text-sm text-muted-foreground', title: empty ? undefined : String(value) }, empty ? '-' : String(value))
}
const statusVariant: Record<number, 'success' | 'warning' | 'secondary'> = { 1: 'success', 2: 'warning' }

export const columns: ColumnDef<ElderVisit>[] = [
  SelectColumn as ColumnDef<ElderVisit>,
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<ElderVisit>, { column, title: '姓名' }),
    meta: { title: '姓名' },
    cell: ({ row }) => h('div', { class: 'max-w-56 truncate text-sm font-medium', title: row.original.name || undefined }, row.original.name || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'typeLabel',
    header: ({ column }) => h(DataTableColumnHeader<ElderVisit>, { column, title: '频次' }),
    meta: { title: '频次' },
    cell: ({ row }) => text(row.original.typeLabel),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'age',
    header: ({ column }) => h(DataTableColumnHeader<ElderVisit>, { column, title: '年龄' }),
    meta: { title: '年龄' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, row.original.age === null || row.original.age === undefined ? '-' : String(row.original.age)),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'address',
    header: ({ column }) => h(DataTableColumnHeader<ElderVisit>, { column, title: '地址' }),
    meta: { title: '地址' },
    cell: ({ row }) => text(row.original.address),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'contactName',
    header: ({ column }) => h(DataTableColumnHeader<ElderVisit>, { column, title: '结对志愿者' }),
    meta: { title: '结对志愿者' },
    cell: ({ row }) => text(row.original.contactName),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<ElderVisit>, { column, title: '状态' }),
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
