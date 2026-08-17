import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import type { ActivityCate } from '../data/schema'

import { activityCateStatusConfig } from '../data/data'
import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<ActivityCate>[] = [
  SelectColumn as ColumnDef<ActivityCate>,
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<ActivityCate>, { column, title: '分类名称' }),
    meta: { title: '分类名称' },
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.getValue('name')),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'torder',
    header: ({ column }) => h(DataTableColumnHeader<ActivityCate>, { column, title: '排序' }),
    meta: { title: '排序' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, row.getValue('torder') ?? '-'),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'activityCount',
    header: ({ column }) => h(DataTableColumnHeader<ActivityCate>, { column, title: '活动数量' }),
    meta: { title: '活动数量' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, row.getValue('activityCount') ?? 0),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'isEnable',
    header: ({ column }) => h(DataTableColumnHeader<ActivityCate>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => {
      const isEnable = row.getValue('isEnable') as number
      const config = activityCateStatusConfig[isEnable]
      if (!config)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      return h(Badge, { class: config.style }, () => config.label)
    },
    enableSorting: false,
    enableResizing: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => h(DataTableRowActions, { row }),
    enableHiding: false,
  },
]
