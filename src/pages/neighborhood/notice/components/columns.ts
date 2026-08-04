import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { INeighborhoodNotice } from '@/services/api/neighborhood-notice.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'
import {
  noticeContentTypeConfig,
  noticePublicStatusConfig,
} from '@/services/api/neighborhood-notice.api'

import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<INeighborhoodNotice>[] = [
  SelectColumn as ColumnDef<INeighborhoodNotice>,
  {
    accessorKey: 'title',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodNotice>, { column, title: '标题' }),
    meta: { title: '标题' },
    cell: ({ row }) => h('div', { class: 'max-w-[240px] truncate text-sm font-medium' }, row.getValue('title') || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },

  {
    accessorKey: 'introduction',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodNotice>, { column, title: '简介' }),
    meta: { title: '简介' },
    cell: ({ row }) => h('div', { class: 'max-w-[260px] truncate text-sm text-muted-foreground' }, row.getValue('introduction') || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'contentType',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodNotice>, { column, title: '内容类型' }),
    meta: { title: '内容类型' },
    cell: ({ row }) => {
      const contentType = row.original.contentType
      if (contentType === undefined || contentType === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = noticeContentTypeConfig[contentType]
      if (!config)
        return null
      return h(Badge, { variant: config.variant }, () => config.label)
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'isPublic',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodNotice>, { column, title: '是否公有' }),
    meta: { title: '是否公有' },
    cell: ({ row }) => {
      const isPublic = row.original.isPublic
      if (isPublic === undefined || isPublic === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = noticePublicStatusConfig[isPublic]
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
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodNotice>, { column, title: '排序' }),
    meta: { title: '排序' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.original.torder ?? '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'createTime',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodNotice>, { column, title: '创建时间' }),
    meta: { title: '创建时间' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.getValue('createTime') || '-'),
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
