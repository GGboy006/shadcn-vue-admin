import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { ICommunityMemberPrice } from '@/services/api/community-member-price.api'

import { DataTableColumnHeader } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'
import { communityMemberPriceEnableConfig } from '@/services/api/community-member-price.api'

import { formatYuan } from '../data/format'
import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<ICommunityMemberPrice>[] = [
  {
    accessorKey: 'priceName',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityMemberPrice>, { column, title: '套餐' }),
    meta: { title: '套餐' },
    cell: ({ row }) => h('div', { class: 'max-w-[200px] truncate text-sm font-medium' }, row.original.priceName || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'price',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityMemberPrice>, { column, title: '售价' }),
    meta: { title: '售价' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, formatYuan(row.original.price)),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'effectiveDays',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityMemberPrice>, { column, title: '有效天数' }),
    meta: { title: '有效天数' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, row.original.effectiveDays ?? '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'isEnable',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityMemberPrice>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => {
      const isEnable = row.original.isEnable
      if (isEnable === undefined || isEnable === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = communityMemberPriceEnableConfig[isEnable]
      if (!config)
        return h('div', { class: 'text-sm text-muted-foreground' }, String(isEnable))
      return h(Badge, { variant: config.variant }, () => config.label)
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'sortOrder',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityMemberPrice>, { column, title: '排序' }),
    meta: { title: '排序' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.original.sortOrder ?? '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'createTime',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityMemberPrice>, { column, title: '创建时间' }),
    meta: { title: '创建时间' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.original.createTime || '-'),
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
