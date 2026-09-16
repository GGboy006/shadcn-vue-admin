import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { ICommunityMemberOrder } from '@/services/api/community-member-order.api'

import { DataTableColumnHeader } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'
import {
  communityMemberOrderPayStatusConfig,
  communityMemberOrderStatusConfig,
  memberOrderPayStatusText,
  memberOrderStatusText,
} from '@/services/api/community-member-order.api'

import { formatDateTime, formatYuan } from '../data/format'
import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<ICommunityMemberOrder>[] = [
  {
    accessorKey: 'orderid',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityMemberOrder>, { column, title: '商户订单号' }),
    meta: { title: '商户订单号' },
    cell: ({ row }) => h('div', { class: 'font-medium tabular-nums' }, row.original.orderid || row.original.uniqueCode || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'priceName',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityMemberOrder>, { column, title: '套餐' }),
    meta: { title: '套餐' },
    cell: ({ row }) => h('div', { class: 'text-sm' }, row.original.priceName || '-'),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'userName',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityMemberOrder>, { column, title: '居民' }),
    meta: { title: '居民' },
    cell: ({ row }) => h('div', { class: 'text-sm' }, [
      h('div', {}, row.original.userName || '-'),
      row.original.phone
        ? h('div', { class: 'text-xs text-muted-foreground tabular-nums' }, row.original.phone)
        : null,
    ]),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'price',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityMemberOrder>, { column, title: '金额' }),
    meta: { title: '金额' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, formatYuan(row.original.price)),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'payStatus',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityMemberOrder>, { column, title: '支付' }),
    meta: { title: '支付' },
    cell: ({ row }) => {
      const payStatus = row.original.payStatus
      const config = payStatus != null ? communityMemberOrderPayStatusConfig[payStatus] : undefined
      return h(Badge, { variant: config?.variant ?? 'secondary' }, () => memberOrderPayStatusText(payStatus))
    },
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityMemberOrder>, { column, title: '订单状态' }),
    meta: { title: '订单状态' },
    cell: ({ row }) => {
      const status = row.original.status
      const config = status != null ? communityMemberOrderStatusConfig[status] : undefined
      return h(Badge, { variant: config?.variant ?? 'secondary' }, () => memberOrderStatusText(status))
    },
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'payTime',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityMemberOrder>, { column, title: '支付时间' }),
    meta: { title: '支付时间' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, formatDateTime(row.original.payTime)),
    enableSorting: false,
    enableResizing: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => h(DataTableRowActions, { row }),
    enableHiding: false,
  },
]
