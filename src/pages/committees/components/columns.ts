import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import { DataTableColumnHeader, DataTableImageCell, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import type { Merchant } from '../../merchants/data/schema'

import { merchantStatusConfig } from '../../merchants/components/columns'
import MerchantNameLink from '../../merchants/components/merchant-name-link.vue'
import DataTableRowActions from './data-table-row-actions.vue'

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
    cell: ({ row }) => h(MerchantNameLink, { merchant: row.original }),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'nickname',
    header: ({ column }) => h(DataTableColumnHeader<Merchant>, { column, title: '管理员昵称' }),
    meta: { title: '管理员昵称' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.getValue('nickname') || '-'),
    enableSorting: false,
    enableHiding: true,
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
    accessorKey: 'serveResidents',
    header: ({ column }) => h(DataTableColumnHeader<Merchant>, { column, title: '服务居民数' }),
    meta: { title: '服务居民数' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, row.original.serveResidents ?? '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'members',
    header: ({ column }) => h(DataTableColumnHeader<Merchant>, { column, title: '成员数' }),
    meta: { title: '成员数' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, row.original.members ?? '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<Merchant>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => {
      const status = row.original.status
      if (!status)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = merchantStatusConfig[status]
      if (!config)
        return null
      return h(Badge, { class: config.style }, () => config.label)
    },
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
