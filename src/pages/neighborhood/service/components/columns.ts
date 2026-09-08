import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { INeighborhoodService } from '@/services/api/neighborhood-service.api'

import { DataTableColumnHeader, DataTableImageCell, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'
import {
  serviceEnableStatusConfig,
  serviceTypeConfig,
} from '@/services/api/neighborhood-service.api'

import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<INeighborhoodService>[] = [
  SelectColumn as ColumnDef<INeighborhoodService>,
  {
    accessorKey: 'poster',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodService>, { column, title: '封面' }),
    meta: { title: '封面' },
    cell: ({ row }) => h(DataTableImageCell, { src: row.original.poster, alt: '封面', size: 'h-10 w-16' }),
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodService>, { column, title: '名称' }),
    meta: { title: '名称' },
    cell: ({ row }) => h('div', { class: 'max-w-[200px] truncate text-sm font-medium' }, row.getValue('name') || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'type',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodService>, { column, title: '跳转类型' }),
    meta: { title: '跳转类型' },
    cell: ({ row }) => {
      const type = row.original.type
      if (type === undefined || type === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = serviceTypeConfig[type]
      if (!config)
        return null
      return h(Badge, { variant: config.variant }, () => config.label)
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'torder',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodService>, { column, title: '排序' }),
    meta: { title: '排序' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground tabular-nums' }, row.original.torder ?? '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'isEnable',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodService>, { column, title: '启用状态' }),
    meta: { title: '启用状态' },
    cell: ({ row }) => {
      const isEnable = row.original.isEnable
      if (isEnable === undefined || isEnable === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = serviceEnableStatusConfig[isEnable]
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
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodService>, { column, title: '创建时间' }),
    meta: { title: '创建时间' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground tabular-nums' }, row.getValue('createTime') || '-'),
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
