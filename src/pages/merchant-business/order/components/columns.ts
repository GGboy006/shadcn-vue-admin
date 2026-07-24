import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import { DataTableColumnHeader } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import type { Order } from '../data/schema'

import { orderStatusConfig } from '../data/status'
import DataTableRowActions from './data-table-row-actions.vue'

function formatTime(iso: string): string {
  if (!iso)
    return '-'
  return iso.replace('T', ' ').slice(0, 16)
}

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: 'orderid',
    header: ({ column }) => h(DataTableColumnHeader<Order>, { column, title: '订单号' }),
    meta: { title: '订单号' },
    cell: ({ row }) => h('div', { class: 'font-medium tabular-nums' }, row.getValue('orderid')),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'customerName',
    header: ({ column }) => h(DataTableColumnHeader<Order>, { column, title: '客户' }),
    meta: { title: '客户' },
    cell: ({ row }) => h('div', { class: 'text-sm' }, row.getValue('customerName') || '-'),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'goodsDesc',
    header: ({ column }) => h(DataTableColumnHeader<Order>, { column, title: '商品描述' }),
    meta: { title: '商品描述' },
    cell: ({ row }) => h('div', { class: 'max-w-[260px] truncate text-sm text-muted-foreground' }, row.getValue('goodsDesc') || '-'),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'price',
    header: ({ column }) => h(DataTableColumnHeader<Order>, { column, title: '金额' }),
    meta: { title: '金额' },
    cell: ({ row }) => {
      const price = row.getValue('price') as number
      return h('div', { class: 'text-sm tabular-nums' }, price != null ? `¥${price}` : '-')
    },
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'payWayLabel',
    header: ({ column }) => h(DataTableColumnHeader<Order>, { column, title: '支付方式' }),
    meta: { title: '支付方式' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.getValue('payWayLabel') || '-'),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'statusType',
    header: ({ column }) => h(DataTableColumnHeader<Order>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => {
      const statusType = row.getValue('statusType') as number
      const config = orderStatusConfig[statusType as 2 | 3 | 4]
      if (!config)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      return h(Badge, { class: config.style }, () => config.label)
    },
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'createTime',
    header: ({ column }) => h(DataTableColumnHeader<Order>, { column, title: '下单时间' }),
    meta: { title: '下单时间' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, formatTime(row.getValue('createTime'))),
    enableSorting: false,
    enableResizing: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => h(DataTableRowActions, { row }),
    enableHiding: false,
  },
]
