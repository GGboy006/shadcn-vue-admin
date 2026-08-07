import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { ICommunityService } from '@/services/api/community-service.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'
import {
  communityServiceEnableStatusConfig,
  communityServiceLocationConfig,
  communityServiceTypeConfig,
} from '@/services/api/community-service.api'

import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<ICommunityService>[] = [
  SelectColumn as ColumnDef<ICommunityService>,
  {
    accessorKey: 'poster',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityService>, { column, title: '封面' }),
    meta: { title: '封面' },
    cell: ({ row }) => {
      const poster = row.original.poster
      if (!poster) {
        return h('div', { class: 'flex h-10 w-14 items-center justify-center rounded bg-muted text-xs text-muted-foreground' }, '无')
      }
      return h('img', {
        src: poster,
        alt: '封面',
        class: 'h-10 w-14 rounded object-cover border',
      })
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityService>, { column, title: '名称' }),
    meta: { title: '名称' },
    cell: ({ row }) => h('div', { class: 'max-w-[200px] truncate text-sm font-medium' }, row.getValue('name') || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },

  {
    accessorKey: 'type',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityService>, { column, title: '服务类型' }),
    meta: { title: '服务类型' },
    cell: ({ row }) => {
      const type = row.original.type
      if (type === undefined || type === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = communityServiceTypeConfig[type]
      if (!config)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      return h(Badge, { variant: config.variant }, () => config.label)
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'location',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityService>, { column, title: '位置' }),
    meta: { title: '位置' },
    cell: ({ row }) => {
      const location = row.original.location
      if (location === undefined || location === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = communityServiceLocationConfig[location]
      if (!config)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      return h('div', { class: 'text-sm text-muted-foreground' }, config.label)
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'isEnable',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityService>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => {
      const isEnable = row.original.isEnable
      if (isEnable === undefined || isEnable === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = communityServiceEnableStatusConfig[isEnable]
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
    header: ({ column }) => h(DataTableColumnHeader<ICommunityService>, { column, title: '排序' }),
    meta: { title: '排序' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.original.torder ?? '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'createTime',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityService>, { column, title: '创建时间' }),
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
