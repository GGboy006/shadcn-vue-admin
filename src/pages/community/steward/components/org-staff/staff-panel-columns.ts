import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { IHousekeeperStaff } from '@/services/api/housekeeper.api'

import { DataTableColumnHeader, DataTableImageCell, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'
import { housekeeperEnableStatusConfig } from '@/services/api/housekeeper.api'

import DataTableRowActions from '../staff/data-table-row-actions.vue'

/** 机构详情内人员表：不含「所属主体」列 */
export const staffPanelColumns: ColumnDef<IHousekeeperStaff>[] = [
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
    accessorKey: 'phone',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperStaff>, { column, title: '电话' }),
    meta: { title: '电话' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.original.phone || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => h(DataTableColumnHeader<IHousekeeperStaff>, { column, title: '职称' }),
    meta: { title: '职称' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.original.title || '-'),
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
    id: 'actions',
    cell: ({ row }) => h(DataTableRowActions, { row }),
    enableHiding: false,
  },
]
