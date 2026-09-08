import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import { DataTableColumnHeader, DataTableImageCell, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import type { Merchant } from '../../merchants/data/schema'

import MerchantStatusSwitch from '../../merchants/components/merchant-status-switch.vue'
import DataTableRowActions from './data-table-row-actions.vue'
import PropertyNameLink from './property-name-link.vue'

export const merchantStatusConfig: Record<number, { label: string, style: string }> = {
  1: { label: '启用', style: 'bg-green-100/30 text-green-900 dark:text-green-200 border-green-200' },
  2: { label: '禁用', style: 'bg-red-100/30 text-red-900 dark:text-red-200 border-red-200' },
}

export const businessStatusConfig: Record<number, { label: string, variant: 'info' | 'warning' | 'secondary' | 'destructive' }> = {
  1: { label: '营业中', variant: 'info' },
  2: { label: '休息中', variant: 'warning' },
  3: { label: '已打烊', variant: 'secondary' },
  4: { label: '暂停营业', variant: 'destructive' },
}

export const columns: ColumnDef<Merchant>[] = [
  SelectColumn as ColumnDef<Merchant>,
  {
    accessorKey: 'avatar',
    header: ({ column }) => h(DataTableColumnHeader<Merchant>, { column, title: '头像' }),
    meta: { title: '头像' },
    cell: ({ row }) => h(DataTableImageCell, { src: row.original.avatar, alt: '头像', shape: 'circle' }),
    enableSorting: false,
    enableHiding: true,
    enableResizing: false,
  },
  {
    accessorKey: 'logo',
    header: ({ column }) => h(DataTableColumnHeader<Merchant>, { column, title: 'Logo' }),
    meta: { title: 'Logo' },
    cell: ({ row }) => h(DataTableImageCell, { src: row.original.logo, alt: 'Logo' }),
    enableSorting: false,
    enableHiding: true,
    enableResizing: false,
  },
  {
    accessorKey: 'merchantName',
    header: ({ column }) => h(DataTableColumnHeader<Merchant>, { column, title: '名称' }),
    meta: { title: '名称' },
    cell: ({ row }) => h(PropertyNameLink, { property: row.original }),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },

  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<Merchant>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => h(MerchantStatusSwitch, { merchant: row.original }),
    enableSorting: false,
    enableResizing: true,
  },

  {
    id: 'contact',
    accessorKey: 'contactName',
    header: ({ column }) => h(DataTableColumnHeader<Merchant>, { column, title: '联系人' }),
    meta: { title: '联系人' },
    cell: ({ row }) => {
      const name = row.original.contactName
      const phone = row.original.contactPhone
      return h('div', { class: 'flex flex-col gap-0.5' }, [
        h('span', { class: 'text-sm' }, name || '-'),
        h('span', { class: 'text-xs text-muted-foreground' }, phone || '-'),
      ])
    },
    enableSorting: false,
    enableResizing: true,
  },

  {
    accessorKey: 'signDate',
    header: ({ column }) => h(DataTableColumnHeader<Merchant>, { column, title: '签约日期' }),
    meta: { title: '签约日期' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, row.getValue('signDate') || '-'),
    enableSorting: false,
    enableResizing: true,
  },

  {
    accessorKey: 'signFee',
    header: ({ column }) => h(DataTableColumnHeader<Merchant>, { column, title: '签约费用' }),
    meta: { title: '签约费用' },
    cell: ({ row }) => {
      const fee = row.getValue('signFee') as number
      return h('div', { class: 'text-sm tabular-nums' }, fee != null ? `$${fee}` : '-')
    },
    enableSorting: false,
    enableResizing: true,
  },

  {
    accessorKey: 'remark',
    header: ({ column }) => h(DataTableColumnHeader<Merchant>, { column, title: '备注' }),
    meta: { title: '备注' },
    cell: ({ row }) => h('div', { class: 'max-w-[200px] truncate text-sm text-muted-foreground' }, row.getValue('remark') || '-'),
    enableSorting: false,
    enableResizing: true,
  },

  {
    accessorKey: 'merchantCode',
    header: ({ column }) => h(DataTableColumnHeader<Merchant>, { column, title: '商户编号' }),
    meta: { title: '商户编号' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.getValue('merchantCode') || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'businessStatus',
    header: ({ column }) => h(DataTableColumnHeader<Merchant>, { column, title: '营业状态' }),
    meta: { title: '营业状态' },
    cell: ({ row }) => {
      const businessStatus = row.getValue('businessStatus') as number
      if (!businessStatus)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = businessStatusConfig[businessStatus]
      if (!config)
        return null
      return h(Badge, { variant: config.variant }, () => config.label)
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'address',
    header: ({ column }) => h(DataTableColumnHeader<Merchant>, { column, title: '详细地址' }),
    meta: { title: '详细地址' },
    cell: ({ row }) => h('div', { class: 'max-w-[200px] truncate text-sm text-muted-foreground' }, row.getValue('address') || '-'),
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
