import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import { DataTableColumnHeader, DataTableImageCell, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import type { Goods } from '../data/schema'

import { goodsRecommendConfig, goodsStatusConfig } from '../data/data'
import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<Goods>[] = [
  SelectColumn as ColumnDef<Goods>,
  {
    accessorKey: 'poster',
    header: ({ column }) => h(DataTableColumnHeader<Goods>, { column, title: '封面' }),
    meta: { title: '封面' },
    cell: ({ row }) => h(DataTableImageCell, { src: row.getValue('poster') as string, alt: '封面', size: 'size-10' }),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<Goods>, { column, title: '商品名称' }),
    meta: { title: '商品名称' },
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.getValue('name')),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'cateName',
    header: ({ column }) => h(DataTableColumnHeader<Goods>, { column, title: '分类' }),
    meta: { title: '分类' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.getValue('cateName') || '-'),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'salePrice',
    header: ({ column }) => h(DataTableColumnHeader<Goods>, { column, title: '价格' }),
    meta: { title: '价格' },
    cell: ({ row }) => {
      const price = row.getValue('salePrice') as number
      return h('div', { class: 'text-sm tabular-nums' }, price != null ? `¥${price}` : '-')
    },
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'isRecommend',
    header: ({ column }) => h(DataTableColumnHeader<Goods>, { column, title: '推荐' }),
    meta: { title: '推荐' },
    cell: ({ row }) => {
      const isRecommend = row.getValue('isRecommend') as number
      const config = goodsRecommendConfig[isRecommend]
      if (!config)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      return h(Badge, { class: config.style }, () => config.label)
    },
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'isEnable',
    header: ({ column }) => h(DataTableColumnHeader<Goods>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => {
      const isEnable = row.getValue('isEnable') as number
      const config = goodsStatusConfig[isEnable]
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
