import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { ICommunityDynamic } from '@/services/api/community-dynamic.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'
import {
  dynamicEnableStatusConfig,
} from '@/services/api/community-dynamic.api'

import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<ICommunityDynamic>[] = [
  SelectColumn as ColumnDef<ICommunityDynamic>,
  {
    accessorKey: 'poster',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityDynamic>, { column, title: '封面' }),
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
    accessorKey: 'title',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityDynamic>, { column, title: '标题' }),
    meta: { title: '标题' },
    cell: ({ row }) => h('div', { class: 'max-w-[240px] truncate text-sm font-medium' }, row.getValue('title') || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },

  {
    accessorKey: 'userName',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityDynamic>, { column, title: '作者' }),
    meta: { title: '作者' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.getValue('userName') || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'original',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityDynamic>, { column, title: '来源' }),
    meta: { title: '来源' },
    cell: ({ row }) => h('div', { class: 'max-w-[160px] truncate text-sm text-muted-foreground' }, row.getValue('original') || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'isEnable',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityDynamic>, { column, title: '状态' }),
    meta: { title: '状态' },
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
    header: ({ column }) => h(DataTableColumnHeader<ICommunityDynamic>, { column, title: '创建时间' }),
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
