import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { INeighborhoodActivity } from '@/services/api/neighborhood-activity.api'

import { DataTableColumnHeader, DataTableImageCell, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'
import {
  activityEnableStatusConfig,
} from '@/services/api/neighborhood-activity.api'

import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<INeighborhoodActivity>[] = [
  SelectColumn as ColumnDef<INeighborhoodActivity>,
  {
    accessorKey: 'poster',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodActivity>, { column, title: '封面' }),
    meta: { title: '封面' },
    cell: ({ row }) => h(DataTableImageCell, { src: row.original.poster, alt: '封面', size: 'size-10' }),
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodActivity>, { column, title: '活动名称' }),
    meta: { title: '活动名称' },
    cell: ({ row }) => h('div', { class: 'max-w-[200px] truncate text-sm font-medium' }, row.getValue('name') || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'cateName',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodActivity>, { column, title: '分类' }),
    meta: { title: '分类' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.getValue('cateName') || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'startTime',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodActivity>, { column, title: '开始时间' }),
    meta: { title: '开始时间' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground tabular-nums' }, row.getValue('startTime') || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'endTime',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodActivity>, { column, title: '结束时间' }),
    meta: { title: '结束时间' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground tabular-nums' }, row.getValue('endTime') || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'isEnable',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodActivity>, { column, title: '启用状态' }),
    meta: { title: '启用状态' },
    cell: ({ row }) => {
      const isEnable = row.original.isEnable
      if (isEnable === undefined || isEnable === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = activityEnableStatusConfig[isEnable]
      if (!config)
        return null
      return h(Badge, { variant: config.variant }, () => config.label)
    },
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
