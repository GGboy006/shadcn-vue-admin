import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { IFeedback } from '@/services/api/feedback.api'

import { DataTableColumnHeader, DataTableImageCell, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'
import { feedbackStatusConfig, feedbackTypeConfig } from '@/services/api/feedback.api'

import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<IFeedback>[] = [
  SelectColumn as ColumnDef<IFeedback>,
  {
    accessorKey: 'avatar',
    header: ({ column }) => h(DataTableColumnHeader<IFeedback>, { column, title: '头像' }),
    meta: { title: '头像' },
    cell: ({ row }) => h(DataTableImageCell, { src: row.original.avatar, alt: '头像', shape: 'circle' }),
    enableSorting: false,
    enableHiding: true,
    enableResizing: false,
  },
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
    accessorKey: 'images',
    header: ({ column }) => h(DataTableColumnHeader<IFeedback>, { column, title: '反馈图片' }),
    meta: { title: '反馈图片' },
    cell: ({ row }) => {
      const images = row.original.images
      if (!images || images.length === 0)
        return h(DataTableImageCell, { size: 'h-10 w-10' })
      return h('div', { class: 'flex items-center gap-1' }, [
        h(DataTableImageCell, { src: images[0], alt: '反馈图片', size: 'h-10 w-10' }),
        images.length > 1 ? h('span', { class: 'text-xs text-muted-foreground' }, `+${images.length - 1}`) : null,
      ])
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: false,
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
