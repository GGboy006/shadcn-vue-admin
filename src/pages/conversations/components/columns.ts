import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { IConversation, UserTag } from '@/services/api/conversation.api'

import { DataTableColumnHeader } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { getConversationModeDisplay, userTagConfig } from '@/services/api/conversation.api'
import { formatDateTime } from '@/utils/date'

import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<IConversation>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => h(DataTableColumnHeader<IConversation>, { column, title: '会话标题' }),
    meta: { title: '会话标题' },
    cell: ({ row }) => h('div', { class: 'flex items-center gap-2 max-w-[200px]' }, [
      h('span', { class: 'font-medium truncate' }, row.getValue('title') || '未命名会话'),
    ]),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'userTag',
    header: ({ column }) => h(DataTableColumnHeader<IConversation>, { column, title: '用户标签' }),
    meta: { title: '用户标签' },
    cell: ({ row }) => {
      const tag = row.getValue('userTag') as UserTag
      return h(Badge, { variant: 'outline' }, () => userTagConfig[tag] || '未知')
    },
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'serviceMode',
    header: ({ column }) => h(DataTableColumnHeader<IConversation>, { column, title: '服务模式' }),
    meta: { title: '服务模式' },
    cell: ({ row }) => {
      const config = getConversationModeDisplay(row.original.serviceMode, row.original.type)
      return h(Badge, { variant: config.variant }, () => config.label)
    },
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'lastMessagePreview',
    header: ({ column }) => h(DataTableColumnHeader<IConversation>, { column, title: '最后消息' }),
    meta: { title: '最后消息' },
    cell: ({ row }) => h('div', { class: 'max-w-[200px] truncate text-sm text-muted-foreground' }, row.getValue('lastMessagePreview') || '-'),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'lastMessageTime',
    header: ({ column }) => h(DataTableColumnHeader<IConversation>, { column, title: '最后消息时间' }),
    meta: { title: '最后消息时间' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground tabular-nums' }, formatDateTime(row.getValue('lastMessageTime'))),
    enableSorting: false,
    enableResizing: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => h(DataTableRowActions, { row: row.original }),
    enableHiding: false,
    enableResizing: false,
  },
]
