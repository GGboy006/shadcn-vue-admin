import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { ICommunityCate } from '@/services/api/community-cate.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'
import {
  communityCateEnableStatusConfig,
  communityCateTypeConfig,
} from '@/services/api/community-cate.api'

import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<ICommunityCate>[] = [
  SelectColumn as ColumnDef<ICommunityCate>,
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityCate>, { column, title: '名称' }),
    meta: { title: '名称' },
    cell: ({ row }) => h('div', { class: 'max-w-[200px] truncate text-sm font-medium' }, row.getValue('name') || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },

  {
    accessorKey: 'type',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityCate>, { column, title: '分类类型' }),
    meta: { title: '分类类型' },
    cell: ({ row }) => {
      const type = row.original.type
      if (type === undefined || type === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = communityCateTypeConfig[type]
      if (!config)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      return h(Badge, { variant: 'info' }, () => config.label)
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'describe',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityCate>, { column, title: '描述' }),
    meta: { title: '描述' },
    cell: ({ row }) => h('div', { class: 'max-w-[240px] truncate text-sm text-muted-foreground' }, row.getValue('describe') || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'isEnable',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityCate>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => {
      const isEnable = row.original.isEnable
      if (isEnable === undefined || isEnable === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = communityCateEnableStatusConfig[isEnable]
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
    header: ({ column }) => h(DataTableColumnHeader<ICommunityCate>, { column, title: '排序' }),
    meta: { title: '排序' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.original.torder ?? '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'createTime',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityCate>, { column, title: '创建时间' }),
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
