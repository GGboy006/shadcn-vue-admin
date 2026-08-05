import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'
import { useRouter } from 'vue-router'

import type { INeighborhoodSpecial } from '@/services/api/neighborhood-special.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'
import { specialEnableStatusConfig } from '@/services/api/neighborhood-special.api'

import DataTableRowActions from './data-table-row-actions.vue'

const router = useRouter()

/** 点击专题名称跳转到该专题下的文章列表(3.8 子页) */
function handleNameClick(special: INeighborhoodSpecial) {
  router.push(`/neighborhood/special/${special.uniqueCode}/article`)
}

export const columns: ColumnDef<INeighborhoodSpecial>[] = [
  SelectColumn as ColumnDef<INeighborhoodSpecial>,
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodSpecial>, { column, title: '专题名称' }),
    meta: { title: '专题名称' },
    cell: ({ row }) => h(
      'button',
      {
        type: 'button',
        class: 'max-w-[200px] truncate text-left text-sm font-medium text-primary hover:underline cursor-pointer',
        title: `查看「${row.original.name}」下的文章`,
        onClick: () => handleNameClick(row.original),
      },
      row.getValue('name') || '-',
    ),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'torder',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodSpecial>, { column, title: '排序' }),
    meta: { title: '排序' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground tabular-nums' }, row.original.torder ?? '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'isEnable',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodSpecial>, { column, title: '启用状态' }),
    meta: { title: '启用状态' },
    cell: ({ row }) => {
      const isEnable = row.original.isEnable
      if (isEnable === undefined || isEnable === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = specialEnableStatusConfig[isEnable]
      if (!config)
        return null
      return h(Badge, { variant: config.variant }, () => config.label)
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'mark',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodSpecial>, { column, title: '备注' }),
    meta: { title: '备注' },
    cell: ({ row }) => h('div', { class: 'max-w-[260px] truncate text-sm text-muted-foreground' }, row.getValue('mark') || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'createTime',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodSpecial>, { column, title: '创建时间' }),
    meta: { title: '创建时间' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground tabular-nums' }, row.getValue('createTime') || '-'),
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
