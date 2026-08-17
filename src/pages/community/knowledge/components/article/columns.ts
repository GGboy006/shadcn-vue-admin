import type { ColumnDef } from '@tanstack/vue-table'

import { PinIcon } from '@lucide/vue'
import { h } from 'vue'

import type { IKnowledgeArticle } from '@/services/api/knowledge.api'

import { DataTableColumnHeader, DataTableImageCell, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'
import { knowledgePublishStatusConfig } from '@/services/api/knowledge.api'

import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<IKnowledgeArticle>[] = [
  SelectColumn as ColumnDef<IKnowledgeArticle>,
  {
    accessorKey: 'coverImage',
    header: ({ column }) => h(DataTableColumnHeader<IKnowledgeArticle>, { column, title: '封面' }),
    meta: { title: '封面' },
    cell: ({ row }) => h(DataTableImageCell, { src: row.original.coverImage, alt: '封面', size: 'h-10 w-16' }),
    enableSorting: false,
    enableHiding: true,
    enableResizing: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => h(DataTableColumnHeader<IKnowledgeArticle>, { column, title: '标题' }),
    meta: { title: '标题' },
    cell: ({ row }) => h('div', { class: 'max-w-[240px] truncate text-sm font-medium' }, row.getValue('title') || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },

  {
    accessorKey: 'categoryName',
    header: ({ column }) => h(DataTableColumnHeader<IKnowledgeArticle>, { column, title: '分类' }),
    meta: { title: '分类' },
    cell: ({ row }) => h('div', { class: 'max-w-[120px] truncate text-sm text-muted-foreground' }, row.getValue('categoryName') || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'summary',
    header: ({ column }) => h(DataTableColumnHeader<IKnowledgeArticle>, { column, title: '摘要' }),
    meta: { title: '摘要' },
    cell: ({ row }) => h('div', { class: 'max-w-[260px] truncate text-sm text-muted-foreground' }, row.getValue('summary') || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'publishStatus',
    header: ({ column }) => h(DataTableColumnHeader<IKnowledgeArticle>, { column, title: '发布状态' }),
    meta: { title: '发布状态' },
    cell: ({ row }) => {
      const publishStatus = row.original.publishStatus
      if (publishStatus === undefined || publishStatus === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = knowledgePublishStatusConfig[publishStatus]
      if (!config)
        return null
      return h(Badge, { variant: config.variant }, () => config.label)
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'topFlag',
    header: ({ column }) => h(DataTableColumnHeader<IKnowledgeArticle>, { column, title: '置顶' }),
    meta: { title: '置顶' },
    cell: ({ row }) => {
      const topFlag = row.original.topFlag
      if (topFlag === 1)
        return h('div', { class: 'flex items-center gap-1 text-sm text-primary' }, [h(PinIcon, { class: 'size-3.5' }), '置顶'])
      return h('div', { class: 'text-sm text-muted-foreground' }, '-')
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'viewCount',
    header: ({ column }) => h(DataTableColumnHeader<IKnowledgeArticle>, { column, title: '浏览' }),
    meta: { title: '浏览' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums text-muted-foreground' }, row.original.viewCount ?? 0),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'likeCount',
    header: ({ column }) => h(DataTableColumnHeader<IKnowledgeArticle>, { column, title: '点赞' }),
    meta: { title: '点赞' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums text-muted-foreground' }, row.original.likeCount ?? 0),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'createTime',
    header: ({ column }) => h(DataTableColumnHeader<IKnowledgeArticle>, { column, title: '创建时间' }),
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
