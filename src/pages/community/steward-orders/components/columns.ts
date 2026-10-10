import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { IHousekeeperOrder } from '@/services/api/housekeeper-order.api'

import { DataTableColumnHeader } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'
import { housekeeperPayModeLabel } from '@/services/api/housekeeper-account'

import { formatDateTime, formatYuan } from '../data/format'
import { housekeeperOrderPayStatusStyle, housekeeperOrderStatusStyle } from '../data/status'
import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<IHousekeeperOrder>[] = [
  {
    accessorKey: 'orderNo',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperOrder>, { column, title: '订单号' }),
    meta: { title: '订单号' },
    cell: ({ row }) => h('div', { class: 'font-medium tabular-nums' }, row.original.orderNo || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'itemName',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperOrder>, { column, title: '服务' }),
    meta: { title: '服务' },
    cell: ({ row }) => h('div', { class: 'text-sm' }, [
      h('div', { class: 'font-medium' }, row.original.itemName || '-'),
      row.original.categoryName
        ? h('div', { class: 'text-xs text-muted-foreground' }, row.original.categoryName)
        : null,
    ]),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'housekeeperName',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperOrder>, { column, title: '馆/师傅' }),
    meta: { title: '馆/师傅' },
    cell: ({ row }) => h('div', { class: 'text-sm' }, [
      h('div', {}, row.original.housekeeperName || '-'),
      h('div', { class: 'text-xs text-muted-foreground' }, row.original.staffName || '待抢单'),
    ]),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'contactName',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperOrder>, { column, title: '联系人' }),
    meta: { title: '联系人' },
    cell: ({ row }) => h('div', { class: 'text-sm' }, [
      h('div', {}, row.original.contactName || '-'),
      row.original.contactPhone
        ? h('div', { class: 'text-xs text-muted-foreground tabular-nums' }, row.original.contactPhone)
        : null,
    ]),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'appointmentTime',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperOrder>, { column, title: '预约时间' }),
    meta: { title: '预约时间' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, formatDateTime(row.original.appointmentTime)),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'totalAmount',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperOrder>, { column, title: '金额' }),
    meta: { title: '金额' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, formatYuan(row.original.totalAmount)),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'payStatus',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperOrder>, { column, title: '支付' }),
    meta: { title: '支付' },
    cell: ({ row }) => {
      const payStatus = row.original.payStatus
      const style = payStatus != null ? housekeeperOrderPayStatusStyle[payStatus] : undefined
      return h(Badge, { class: style ?? 'text-muted-foreground' }, () => row.original.payStatusLabel || '-')
    },
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'payMode',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperOrder>, { column, title: '支付方式' }),
    meta: { title: '支付方式' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, housekeeperPayModeLabel(row.original.payMode) || '-'),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'orderStatus',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperOrder>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => {
      const orderStatus = row.original.orderStatus
      const style = housekeeperOrderStatusStyle[orderStatus]
      return h(Badge, { class: style ?? 'text-muted-foreground' }, () => row.original.orderStatusLabel || '-')
    },
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'fulfillProviderCode',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperOrder>, { column, title: '履约' }),
    meta: { title: '履约' },
    cell: ({ row }) => {
      const code = row.original.fulfillProviderCode
      const local = !code || code === 'LOCAL'
      return h('div', { class: 'text-sm text-muted-foreground' }, local ? '本站' : code)
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'createTime',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperOrder>, { column, title: '下单时间' }),
    meta: { title: '下单时间' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, formatDateTime(row.original.createTime)),
    enableSorting: false,
    enableResizing: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => h(DataTableRowActions, { row }),
    enableHiding: false,
  },
]
