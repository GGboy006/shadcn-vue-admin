import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { IKnowledgeQuestion } from '@/services/api/knowledge.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'
import { knowledgeEnableStatusConfig } from '@/services/api/knowledge.api'

import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<IKnowledgeQuestion>[] = [
  SelectColumn as ColumnDef<IKnowledgeQuestion>,
  {
    accessorKey: 'questionName',
    header: ({ column }) => h(DataTableColumnHeader<IKnowledgeQuestion>, { column, title: '问答名称' }),
    meta: { title: '问答名称' },
    cell: ({ row }) => h('div', { class: 'max-w-[200px] truncate text-sm font-medium' }, row.getValue('questionName') || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },

  {
    accessorKey: 'keyword',
    header: ({ column }) => h(DataTableColumnHeader<IKnowledgeQuestion>, { column, title: '关键词' }),
    meta: { title: '关键词' },
    cell: ({ row }) => h('div', { class: 'max-w-[160px] truncate text-sm text-muted-foreground' }, row.getValue('keyword') || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'prompt',
    header: ({ column }) => h(DataTableColumnHeader<IKnowledgeQuestion>, { column, title: '提示词' }),
    meta: { title: '提示词' },
    cell: ({ row }) => h('div', { class: 'max-w-[280px] truncate text-sm text-muted-foreground' }, row.getValue('prompt') || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<IKnowledgeQuestion>, { column, title: '状态' }),
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
    header: ({ column }) => h(DataTableColumnHeader<IKnowledgeQuestion>, { column, title: '创建时间' }),
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
