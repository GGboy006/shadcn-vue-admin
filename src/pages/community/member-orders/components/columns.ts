import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { ICommunityMemberOrder } from '@/services/api/community-member-order.api'

import { DataTableColumnHeader } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'
import {
  communityMemberOrderPayStatusConfig,
  communityMemberOrderStatusConfig,
  memberOrderPayStatusText,
  memberOrderPayWayText,
  memberOrderStatusText,
} from '@/services/api/community-member-order.api'

import { formatDateTime, formatYuan } from '../data/format'
import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<ICommunityMemberOrder>[] = [
  {
    accessorKey: 'orderNo',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityMemberOrder>, { column, title: '订单号' }),
    meta: { title: '订单号' },
    cell: ({ row }) => h('div', { class: 'font-medium tabular-nums' }, row.original.orderNo || row.original.orderId || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'packageName',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityMemberOrder>, { column, title: '套餐' }),
    meta: { title: '套餐' },
    cell: ({ row }) => h('div', { class: 'text-sm' }, row.original.packageName || '-'),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'userId',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityMemberOrder>, { column, title: '用户 ID' }),
    meta: { title: '用户 ID' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums text-muted-foreground' }, row.original.userId || '-'),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityMemberOrder>, { column, title: '金额' }),
    meta: { title: '金额' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, formatYuan(row.original.amount ?? row.original.payAmount)),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'payWay',
    header: ({ column }) => h(DataTableColumnHeader<ICommunityMemberOrder>, { column, title: '支付方式' }),
    meta: { title: '支付方式' },
    cell: ({ row }) => h('div', { class: 'text-sm' }, memberOrderPayWayText(row.original.payWay) ?? '-'),
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
