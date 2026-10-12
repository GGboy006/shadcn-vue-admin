import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { IHousekeeperStaff } from '@/services/api/housekeeper.api'

import { DataTableColumnHeader, DataTableImageCell, OverflowText, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'
import { housekeeperEnableStatusConfig } from '@/services/api/housekeeper.api'

import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<IHousekeeperStaff>[] = [
  SelectColumn as ColumnDef<IHousekeeperStaff>,
  {
    accessorKey: 'avatar',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperStaff>, { column, title: '头像' }),
    meta: { title: '头像' },
    cell: ({ row }) => h(DataTableImageCell, { src: row.original.avatar, alt: '头像', shape: 'circle' }),
    enableSorting: false,
    enableHiding: true,
    enableResizing: false,
  },
  {
    accessorKey: 'staffName',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperStaff>, { column, title: '人员姓名' }),
    meta: { title: '人员姓名' },
    cell: ({ row }) => h('div', { class: 'text-sm font-medium' }, row.original.staffName || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'housekeeperName',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperStaff>, { column, title: '所属主体' }),
    meta: { title: '所属主体' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.original.housekeeperName || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperStaff>, { column, title: '电话' }),
    meta: { title: '电话' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.original.phone || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'serviceSkills',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperStaff>, { column, title: '技能' }),
    meta: { title: '技能' },
    cell: ({ row }) => h(OverflowText, { text: row.original.serviceSkills?.join('、') }),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'sortOrder',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperStaff>, { column, title: '排序' }),
    meta: { title: '排序' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.original.sortOrder ?? '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperStaff>, { column, title: '状态' }),
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
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperStaff>, { column, title: '创建时间' }),
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
