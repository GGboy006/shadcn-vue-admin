import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { IFeedback } from '@/services/api/feedback.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'
import { feedbackStatusConfig, feedbackTypeConfig } from '@/services/api/feedback.api'

import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<IFeedback>[] = [
  SelectColumn as ColumnDef<IFeedback>,
  {
    accessorKey: 'userName',
    header: ({ column }) => h(DataTableColumnHeader<IFeedback>, { column, title: '反馈人' }),
    meta: { title: '反馈人' },
    cell: ({ row }) => {
      const name = row.original.userName || '-'
      const phone = row.original.userPhone
      return h('div', { class: 'text-sm' }, [
        h('div', { class: 'font-medium' }, name),
        phone ? h('div', { class: 'text-xs text-muted-foreground' }, phone) : null,
      ])
    },
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'feedbackType',
    header: ({ column }) => h(DataTableColumnHeader<IFeedback>, { column, title: '类型' }),
    meta: { title: '类型' },
    cell: ({ row }) => {
      const type = row.original.feedbackType
      if (type === undefined || type === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = feedbackTypeConfig[type]
      if (!config)
        return null
      return h(Badge, { variant: config.variant }, () => config.label)
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'content',
    header: ({ column }) => h(DataTableColumnHeader<IFeedback>, { column, title: '内容' }),
    meta: { title: '内容' },
    cell: ({ row }) => h('div', { class: 'max-w-[300px] truncate text-sm text-muted-foreground' }, row.original.content || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<IFeedback>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => {
      const status = row.original.status
      if (status === undefined || status === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = feedbackStatusConfig[status]
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
    header: ({ column }) => h(DataTableColumnHeader<IFeedback>, { column, title: '反馈时间' }),
    meta: { title: '反馈时间' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground whitespace-nowrap' }, row.original.createTime || '-'),
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
