import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import type { Faq } from '../data/schema'

import { faqStatusConfig } from '../data/data'
import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<Faq>[] = [
  SelectColumn as ColumnDef<Faq>,
  {
    accessorKey: 'categoryName',
    header: ({ column }) => h(DataTableColumnHeader<Faq>, { column, title: '标签' }),
    meta: { title: '标签' },
    cell: ({ row }) => {
      const name = row.getValue('categoryName') as string
      return name
        ? h(Badge, { variant: 'secondary' }, () => name)
        : h('div', { class: 'text-sm text-muted-foreground' }, '-')
    },
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'question',
    header: ({ column }) => h(DataTableColumnHeader<Faq>, { column, title: '问题' }),
    meta: { title: '问题' },
    cell: ({ row }) => h('div', { class: 'font-medium max-w-[260px] truncate' }, row.getValue('question')),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'answer',
    header: ({ column }) => h(DataTableColumnHeader<Faq>, { column, title: '答案' }),
    meta: { title: '答案' },
    cell: ({ row }) => h('div', { class: 'max-w-[300px] truncate text-sm text-muted-foreground' }, row.getValue('answer') || '-'),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'torder',
    header: ({ column }) => h(DataTableColumnHeader<Faq>, { column, title: '排序' }),
    meta: { title: '排序' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, row.getValue('torder') ?? '-'),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'isEnable',
    header: ({ column }) => h(DataTableColumnHeader<Faq>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => {
      const isEnable = row.getValue('isEnable') as number
      const config = faqStatusConfig[isEnable]
      if (!config)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      return h(Badge, { class: config.style }, () => config.label)
    },
    enableSorting: false,
    enableResizing: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => h(DataTableRowActions, { row }),
    enableHiding: false,
  },
]
