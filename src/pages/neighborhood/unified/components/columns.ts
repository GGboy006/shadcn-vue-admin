import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { INeighborhoodUnified } from '@/services/api/neighborhood-unified.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'
import {
  unifiedEnableStatusConfig,
  unifiedPositionConfig,
  unifiedTypeConfig,
} from '@/services/api/neighborhood-unified.api'

import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<INeighborhoodUnified>[] = [
  SelectColumn as ColumnDef<INeighborhoodUnified>,
  {
    accessorKey: 'poster',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodUnified>, { column, title: '封面' }),
    meta: { title: '封面' },
    cell: ({ row }) => {
      const poster = row.original.poster
      if (!poster)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      return h('img', { src: poster, alt: '封面', class: 'h-10 w-16 rounded border object-cover' })
    },
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodUnified>, { column, title: '名称' }),
    meta: { title: '名称' },
    cell: ({ row }) => h('div', { class: 'max-w-[200px] truncate text-sm font-medium' }, row.getValue('name') || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'type',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodUnified>, { column, title: '栏目类型' }),
    meta: { title: '栏目类型' },
    cell: ({ row }) => {
      const type = row.original.type
      if (type === undefined || type === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = unifiedTypeConfig[type]
      if (!config)
        return null
      return h(Badge, { variant: 'info' }, () => config.label)
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'position',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodUnified>, { column, title: '位置' }),
    meta: { title: '位置' },
    cell: ({ row }) => {
      const position = row.original.position
      if (position === undefined || position === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = unifiedPositionConfig[position]
      if (!config)
        return null
      return h(Badge, { variant: 'secondary' }, () => config.label)
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'torder',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodUnified>, { column, title: '排序' }),
    meta: { title: '排序' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground tabular-nums' }, row.original.torder ?? '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'isEnable',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodUnified>, { column, title: '启用状态' }),
    meta: { title: '启用状态' },
    cell: ({ row }) => {
      const isEnable = row.original.isEnable
      if (isEnable === undefined || isEnable === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = unifiedEnableStatusConfig[isEnable]
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
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodUnified>, { column, title: '创建时间' }),
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
