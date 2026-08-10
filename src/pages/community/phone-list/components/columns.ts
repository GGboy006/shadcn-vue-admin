import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { ICommunityPhone } from '@/services/api/community-phone.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import { Copy } from '@/components/prop-ui/copy'
import Badge from '@/components/ui/badge/Badge.vue'
import {
  communityPhoneEnableStatusConfig,
  communityPhoneTypeConfig,
} from '@/services/api/community-phone.api'

import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<ICommunityPhone>[] = [
  SelectColumn as ColumnDef<ICommunityPhone>,
  {
    accessorKey: 'poster',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityPhone>, { column, title: '图片' }),
    meta: { title: '图片' },
    cell: ({ row }) => {
      const poster = row.original.poster
      if (!poster) {
        return h('div', { class: 'flex size-9 items-center justify-center rounded bg-muted text-xs text-muted-foreground' }, '无')
      }
      return h('img', {
        src: poster,
        alt: row.original.title,
        class: 'size-9 rounded object-cover border',
      })
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'title',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityPhone>, { column, title: '标题' }),
    meta: { title: '标题' },
    cell: ({ row }) => h('div', { class: 'max-w-[200px] truncate text-sm font-medium' }, row.getValue('title') || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },

  {
    accessorKey: 'type',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityPhone>, { column, title: '电话类型' }),
    meta: { title: '电话类型' },
    cell: ({ row }) => {
      const type = row.original.type
      if (type === undefined || type === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = communityPhoneTypeConfig[type]
      if (!config)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      return h(Badge, { variant: config.variant }, () => config.label)
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'regionPhone',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityPhone>, { column, title: '值班电话' }),
    meta: { title: '值班电话' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.original.regionPhone || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'contactUser',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityPhone>, { column, title: '联系人' }),
    meta: { title: '联系人' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.original.contactUser || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'contactPhone',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityPhone>, { column, title: '联系电话' }),
    meta: { title: '联系电话' },
    cell: ({ row }) => {
      const phone = row.original.contactPhone
      if (!phone)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      return h('div', { class: 'flex items-center gap-1' }, [
        h('span', { class: 'text-sm text-muted-foreground' }, phone),
        h(Copy, {
          content: phone,
          size: 'sm',
          variant: 'ghost',
          copyTooltipText: '复制手机号',
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
    header: ({ column }) => h(DataTableColumnHeader<ICommunityPhone>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => {
      const isEnable = row.original.isEnable
      if (isEnable === undefined || isEnable === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = communityPhoneEnableStatusConfig[isEnable]
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
    header: ({ column }) => h(DataTableColumnHeader<ICommunityPhone>, { column, title: '创建时间' }),
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
