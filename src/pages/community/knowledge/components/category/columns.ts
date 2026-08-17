import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { IKnowledgeCategory } from '@/services/api/knowledge.api'

import { DataTableColumnHeader, DataTableImageCell, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'
import {
  knowledgeCategoryTypeConfig,
  knowledgeEnableStatusConfig,
} from '@/services/api/knowledge.api'

import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<IKnowledgeCategory>[] = [
  SelectColumn as ColumnDef<IKnowledgeCategory>,
  {
    accessorKey: 'icon',
    header: ({ column }) => h(DataTableColumnHeader<IKnowledgeCategory>, { column, title: '图标' }),
    meta: { title: '图标' },
    cell: ({ row }) => h(DataTableImageCell, { src: row.original.icon, alt: '图标' }),
    enableSorting: false,
    enableHiding: true,
    enableResizing: false,
  },
  {
    accessorKey: 'categoryName',
    header: ({ column }) => h(DataTableColumnHeader<IKnowledgeCategory>, { column, title: '分类名称' }),
    meta: { title: '分类名称' },
    cell: ({ row }) => h('div', { class: 'max-w-[200px] truncate text-sm font-medium' }, row.getValue('categoryName') || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },

  {
    accessorKey: 'categoryType',
    header: ({ column }) => h(DataTableColumnHeader<IKnowledgeCategory>, { column, title: '分类类型' }),
    meta: { title: '分类类型' },
    cell: ({ row }) => {
      const categoryType = row.original.categoryType
      if (categoryType === undefined || categoryType === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = knowledgeCategoryTypeConfig[categoryType]
      if (!config)
        return null
      return h(Badge, { variant: config.variant }, () => config.label)
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'articleCount',
    header: ({ column }) => h(DataTableColumnHeader<IKnowledgeCategory>, { column, title: '文章数' }),
    meta: { title: '文章数' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums text-muted-foreground' }, row.original.articleCount ?? 0),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<IKnowledgeCategory>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => {
      const status = row.original.status
      if (status === undefined || status === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = knowledgeEnableStatusConfig[status]
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
    header: ({ column }) => h(DataTableColumnHeader<IKnowledgeCategory>, { column, title: '创建时间' }),
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
