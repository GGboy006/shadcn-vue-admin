import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { INeighborhoodBanner } from '@/services/api/neighborhood-banner.api'

import { DataTableColumnHeader, DataTableImageCell, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'
import {
  bannerEnableStatusConfig,
  bannerPositionConfig,
  bannerTypeConfig,
} from '@/services/api/neighborhood-banner.api'

import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<INeighborhoodBanner>[] = [
  SelectColumn as ColumnDef<INeighborhoodBanner>,
  {
    accessorKey: 'poster',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodBanner>, { column, title: '封面' }),
    meta: { title: '封面' },
    cell: ({ row }) => h(DataTableImageCell, { src: row.original.poster, alt: '封面', size: 'h-10 w-16' }),
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodBanner>, { column, title: '名称' }),
    meta: { title: '名称' },
    cell: ({ row }) => h('div', { class: 'max-w-[200px] truncate text-sm font-medium' }, row.getValue('name') || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'position',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodBanner>, { column, title: '位置' }),
    meta: { title: '位置' },
    cell: ({ row }) => {
      const position = row.original.position
      if (position === undefined || position === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = bannerPositionConfig[position]
      if (!config)
        return null
      return h(Badge, { variant: 'secondary' }, () => config.label)
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'type',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodBanner>, { column, title: '跳转类型' }),
    meta: { title: '跳转类型' },
    cell: ({ row }) => {
      const type = row.original.type
      if (type === undefined || type === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = bannerTypeConfig[type]
      if (!config)
        return null
      return h(Badge, { variant: config.variant }, () => config.label)
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'startTime',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodBanner>, { column, title: '投放开始' }),
    meta: { title: '投放开始' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums text-muted-foreground' }, row.getValue('startTime') || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'endTime',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodBanner>, { column, title: '投放结束' }),
    meta: { title: '投放结束' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums text-muted-foreground' }, row.getValue('endTime') || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'isEnable',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodBanner>, { column, title: '启用状态' }),
    meta: { title: '启用状态' },
    cell: ({ row }) => {
      const isEnable = row.original.isEnable
      if (isEnable === undefined || isEnable === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = bannerEnableStatusConfig[isEnable]
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
