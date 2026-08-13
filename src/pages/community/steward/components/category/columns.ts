import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { IHousekeeperCategory } from '@/services/api/housekeeper.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'
import { housekeeperEnableStatusConfig } from '@/services/api/housekeeper.api'

import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<IHousekeeperCategory>[] = [
  SelectColumn as ColumnDef<IHousekeeperCategory>,
  {
    accessorKey: 'categoryName',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperCategory>, { column, title: '分类名称' }),
    meta: { title: '分类名称' },
    cell: ({ row }) => h('div', { class: 'text-sm font-medium' }, row.original.categoryName || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'categoryCode',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperCategory>, { column, title: '分类编码' }),
    meta: { title: '分类编码' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.original.categoryCode || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'providerCount',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperCategory>, { column, title: '已分配人数' }),
    meta: { title: '已分配人数' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, row.original.providerCount ?? 0),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'sortOrder',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperCategory>, { column, title: '排序' }),
    meta: { title: '排序' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.original.sortOrder ?? '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperCategory>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => {
      const status = row.original.status
      if (status === undefined || status === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = housekeeperEnableStatusConfig[status]
      if (!config)
        return null
      return h(Badge, { variant: config.variant }, () => config.label)
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'createTime',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperCategory>, { column, title: '创建时间' }),
    meta: { title: '创建时间' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground whitespace-nowrap' }, row.original.createTime || '-'),
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
