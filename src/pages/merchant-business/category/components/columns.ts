import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import type { Category } from '../data/schema'

import { cateStatusConfig } from '../data/data'
import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<Category>[] = [
  SelectColumn as ColumnDef<Category>,
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<Category>, { column, title: '分类名称' }),
    meta: { title: '分类名称' },
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.getValue('name')),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'torder',
    header: ({ column }) => h(DataTableColumnHeader<Category>, { column, title: '排序' }),
    meta: { title: '排序' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, row.getValue('torder') ?? '-'),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'goodsCount',
    header: ({ column }) => h(DataTableColumnHeader<Category>, { column, title: '商品数量' }),
    meta: { title: '商品数量' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, row.getValue('goodsCount') ?? 0),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'isEnable',
    header: ({ column }) => h(DataTableColumnHeader<Category>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => {
      const isEnable = row.getValue('isEnable') as number
      const config = cateStatusConfig[isEnable]
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
