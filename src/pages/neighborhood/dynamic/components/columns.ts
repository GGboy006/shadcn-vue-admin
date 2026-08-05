import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { INeighborhoodDynamic } from '@/services/api/neighborhood-dynamic.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'
import {
  dynamicAuditStatusConfig,
  dynamicContentTypeConfig,
  dynamicEnableStatusConfig,
} from '@/services/api/neighborhood-dynamic.api'

import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<INeighborhoodDynamic>[] = [
  SelectColumn as ColumnDef<INeighborhoodDynamic>,
  {
    accessorKey: 'title',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodDynamic>, { column, title: '标题' }),
    meta: { title: '标题' },
    cell: ({ row }) => h('div', { class: 'max-w-[240px] truncate text-sm font-medium' }, row.getValue('title') || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'contentType',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodDynamic>, { column, title: '内容类型' }),
    meta: { title: '内容类型' },
    cell: ({ row }) => {
      const contentType = row.original.contentType
      if (contentType === undefined || contentType === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = dynamicContentTypeConfig[contentType]
      if (!config)
        return null
      return h(Badge, { variant: config.variant }, () => config.label)
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'original',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodDynamic>, { column, title: '来源' }),
    meta: { title: '来源' },
    cell: ({ row }) => h('div', { class: 'max-w-[160px] truncate text-sm text-muted-foreground' }, row.getValue('original') || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'authorName',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodDynamic>, { column, title: '作者' }),
    meta: { title: '作者' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.getValue('authorName') || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodDynamic>, { column, title: '审核状态' }),
    meta: { title: '审核状态' },
    cell: ({ row }) => {
      const status = row.original.status
      if (status === undefined || status === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = dynamicAuditStatusConfig[status]
      if (!config)
        return null
      return h(Badge, { variant: config.variant }, () => config.label)
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'isEnable',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodDynamic>, { column, title: '启用状态' }),
    meta: { title: '启用状态' },
    cell: ({ row }) => {
      const isEnable = row.original.isEnable
      if (isEnable === undefined || isEnable === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = dynamicEnableStatusConfig[isEnable]
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
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodDynamic>, { column, title: '创建时间' }),
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
