import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { IPartnerStaff } from '@/services/api/housekeeper-partner.api'

import { DataTableColumnHeader, DataTableImageCell, OverflowText, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'
import { housekeeperEnableStatusConfig } from '@/services/api/housekeeper.api'

import DataTableRowActions from './data-table-row-actions.vue'

function priceText(staff: IPartnerStaff) {
  if (staff.unitPrice == null)
    return '-'
  return staff.priceUnit ? `${staff.unitPrice}/${staff.priceUnit}` : String(staff.unitPrice)
}

export const columns: ColumnDef<IPartnerStaff>[] = [
  SelectColumn as ColumnDef<IPartnerStaff>,
  {
    accessorKey: 'avatar',
    header: ({ column }) => h(DataTableColumnHeader<IPartnerStaff>, { column, title: '头像' }),
    meta: { title: '头像' },
    cell: ({ row }) => h(DataTableImageCell, { src: row.original.avatar, alt: '头像', shape: 'circle' }),
    enableSorting: false,
    enableHiding: true,
    enableResizing: false,
  },
  {
    accessorKey: 'staffName',
    header: ({ column }) => h(DataTableColumnHeader<IPartnerStaff>, { column, title: '人员姓名' }),
    meta: { title: '人员姓名' },
    cell: ({ row }) => h('div', { class: 'text-sm font-medium' }, row.original.staffName || '-'),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => h(DataTableColumnHeader<IPartnerStaff>, { column, title: '电话' }),
    meta: { title: '电话' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.original.phone || '-'),
    enableSorting: false,
  },
  {
    accessorKey: 'serviceSkills',
    header: ({ column }) => h(DataTableColumnHeader<IPartnerStaff>, { column, title: '技能' }),
    meta: { title: '技能' },
    cell: ({ row }) => h(OverflowText, { text: row.original.serviceSkills?.join('、') || '-' }),
    enableSorting: false,
  },
  {
    accessorKey: 'unitPrice',
    header: ({ column }) => h(DataTableColumnHeader<IPartnerStaff>, { column, title: '单价' }),
    meta: { title: '单价' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, priceText(row.original)),
    enableSorting: false,
  },
  {
    accessorKey: 'score',
    header: ({ column }) => h(DataTableColumnHeader<IPartnerStaff>, { column, title: '评分' }),
    meta: { title: '评分' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.original.score ?? '-'),
    enableSorting: false,
  },
  {
    accessorKey: 'sortOrder',
    header: ({ column }) => h(DataTableColumnHeader<IPartnerStaff>, { column, title: '排序' }),
    meta: { title: '排序' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.original.sortOrder ?? '-'),
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<IPartnerStaff>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => {
      const status = row.original.status
      if (status == null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = housekeeperEnableStatusConfig[status]
      if (!config)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      return h(Badge, { variant: config.variant }, () => config.label)
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: ({ row }) => h(DataTableRowActions, { row }),
    enableHiding: false,
  },
]
