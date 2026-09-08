import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { ICommunityServiceGuide } from '@/services/api/community-service-guide.api'

import { DataTableColumnHeader, DataTableImageCell, SelectColumn } from '@/components/data-table'
import PropPiCopy from '@/components/prop-ui/copy/Copy.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import { serviceGuideEnableStatusConfig } from '@/services/api/community-service-guide.api'

import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<ICommunityServiceGuide>[] = [
  SelectColumn as ColumnDef<ICommunityServiceGuide>,
  {
    accessorKey: 'poster',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityServiceGuide>, { column, title: '封面' }),
    meta: { title: '封面' },
    cell: ({ row }) => h(DataTableImageCell, { src: row.original.poster, alt: row.original.title }),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'title',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityServiceGuide>, { column, title: '标题' }),
    meta: { title: '标题' },
    cell: ({ row }) => h('div', { class: 'max-w-[200px] truncate text-sm font-medium' }, row.getValue('title') || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },

  {
    accessorKey: 'unit',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityServiceGuide>, { column, title: '单位' }),
    meta: { title: '单位' },
    cell: ({ row }) => h('div', { class: 'max-w-[160px] truncate text-sm text-muted-foreground' }, row.original.unit || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'phone',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityServiceGuide>, { column, title: '电话' }),
    meta: { title: '电话' },
    cell: ({ row }) => {
      const phone = row.original.phone
      if (!phone)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      return h('div', { class: 'flex items-center gap-1' }, [
        h('span', { class: 'text-sm text-muted-foreground' }, phone),
        h(PropPiCopy, {
          content: phone,
          size: 'sm',
          variant: 'ghost',
          copyTooltipText: '复制电话',
          copiedTooltipText: '已复制',
        }),
      ])
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'isEnable',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityServiceGuide>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => {
      const isEnable = row.original.isEnable
      if (isEnable === undefined || isEnable === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = serviceGuideEnableStatusConfig[isEnable]
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
    header: ({ column }) => h(DataTableColumnHeader<ICommunityServiceGuide>, { column, title: '创建时间' }),
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
