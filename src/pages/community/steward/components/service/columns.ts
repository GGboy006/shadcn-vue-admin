import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { IHousekeeperService } from '@/services/api/housekeeper.api'

import { DataTableColumnHeader, DataTableImageCell, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'
import { housekeeperEnableStatusConfig } from '@/services/api/housekeeper.api'

import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<IHousekeeperService>[] = [
  SelectColumn as ColumnDef<IHousekeeperService>,
  {
    accessorKey: 'icon',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperService>, { column, title: '图标' }),
    meta: { title: '图标' },
    cell: ({ row }) => h(DataTableImageCell, { src: row.original.icon, alt: '图标' }),
    enableSorting: false,
    enableHiding: true,
    enableResizing: false,
  },
  {
    accessorKey: 'coverImage',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperService>, { column, title: '封面' }),
    meta: { title: '封面' },
    cell: ({ row }) => h(DataTableImageCell, { src: row.original.coverImage, alt: '封面', size: 'h-10 w-16' }),
    enableSorting: false,
    enableHiding: true,
    enableResizing: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperService>, { column, title: '服务名称' }),
    meta: { title: '服务名称' },
    cell: ({ row }) => h('div', { class: 'text-sm font-medium' }, row.original.name || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'contactName',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperService>, { column, title: '联系人' }),
    meta: { title: '联系人' },
    cell: ({ row }) => {
      const name = row.original.contactName || '-'
      const phone = row.original.contactPhone
      return h('div', { class: 'text-sm' }, [
        h('div', {}, name),
        phone ? h('div', { class: 'text-xs text-muted-foreground' }, phone) : null,
      ])
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'staffCount',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperService>, { column, title: '人员数' }),
    meta: { title: '人员数' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, row.original.staffCount ?? 0),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'sortOrder',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperService>, { column, title: '排序' }),
    meta: { title: '排序' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.original.sortOrder ?? '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperService>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => {
      const status = row.original.status
      if (status === undefined || status === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = housekeeperEnableStatusConfig[status]
      if (!config)
        return null
      return h(Badge, { variant: config.variant }, () => config.label)
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'createTime',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperService>, { column, title: '创建时间' }),
    meta: { title: '创建时间' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground whitespace-nowrap' }, row.original.createTime || '-'),
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
