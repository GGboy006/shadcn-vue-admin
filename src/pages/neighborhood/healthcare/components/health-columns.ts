import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { HealthRecord } from '@/services/api/neighborhood-resident.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import DataTableRowActions from './health-data-table-row-actions.vue'

function text(value: string | number | null | undefined) {
  const empty = value === null || value === undefined || value === ''
  return h('div', { class: 'max-w-56 truncate text-sm text-muted-foreground', title: empty ? undefined : String(value) }, empty ? '-' : String(value))
}
const statusVariant: Record<number, 'secondary' | 'success' | 'secondary'> = { 1: 'success', 2: 'secondary' }

export const columns: ColumnDef<HealthRecord>[] = [
  SelectColumn as ColumnDef<HealthRecord>,
  {
    accessorKey: 'userName',
    header: ({ column }) => h(DataTableColumnHeader<HealthRecord>, { column, title: '姓名' }),
    meta: { title: '姓名' },
    cell: ({ row }) => h('div', { class: 'max-w-56 truncate text-sm font-medium', title: row.original.userName || undefined }, row.original.userName || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'code',
    header: ({ column }) => h(DataTableColumnHeader<HealthRecord>, { column, title: '档案号' }),
    meta: { title: '档案号' },
    cell: ({ row }) => text(row.original.code),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'genderLabel',
    header: ({ column }) => h(DataTableColumnHeader<HealthRecord>, { column, title: '性别' }),
    meta: { title: '性别' },
    cell: ({ row }) => text(row.original.genderLabel),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'age',
    header: ({ column }) => h(DataTableColumnHeader<HealthRecord>, { column, title: '年龄' }),
    meta: { title: '年龄' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, row.original.age === null || row.original.age === undefined ? '-' : String(row.original.age)),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'bloodPressure',
    header: ({ column }) => h(DataTableColumnHeader<HealthRecord>, { column, title: '血压' }),
    meta: { title: '血压' },
    cell: ({ row }) => text(row.original.bloodPressure),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'bloodSugar',
    header: ({ column }) => h(DataTableColumnHeader<HealthRecord>, { column, title: '血糖' }),
    meta: { title: '血糖' },
    cell: ({ row }) => text(row.original.bloodSugar),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'intro',
    header: ({ column }) => h(DataTableColumnHeader<HealthRecord>, { column, title: '体检机构' }),
    meta: { title: '体检机构' },
    cell: ({ row }) => text(row.original.intro),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'signDate',
    header: ({ column }) => h(DataTableColumnHeader<HealthRecord>, { column, title: '体检日期' }),
    meta: { title: '体检日期' },
    cell: ({ row }) => text(row.original.signDate),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<HealthRecord>, { column, title: '状态' }),
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
