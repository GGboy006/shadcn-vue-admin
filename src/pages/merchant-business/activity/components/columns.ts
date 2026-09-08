import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import { DataTableColumnHeader, DataTableImageCell, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import type { Activity } from '../data/schema'

import { activityChargeConfig, activityStatusConfig } from '../data/data'
import DataTableRowActions from './data-table-row-actions.vue'

/** 格式化时间显示 */
function formatTime(iso: string): string {
  if (!iso)
    return '-'
  // 取 YYYY-MM-DD HH:mm
  return iso.replace('T', ' ').slice(0, 16)
}

export const columns: ColumnDef<Activity>[] = [
  SelectColumn as ColumnDef<Activity>,
  {
    accessorKey: 'poster',
    header: ({ column }) => h(DataTableColumnHeader<Activity>, { column, title: '封面' }),
    meta: { title: '封面' },
    cell: ({ row }) => h(DataTableImageCell, { src: row.getValue('poster') as string, alt: '封面', size: 'size-10' }),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<Activity>, { column, title: '活动名称' }),
    meta: { title: '活动名称' },
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.getValue('name')),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'cateName',
    header: ({ column }) => h(DataTableColumnHeader<Activity>, { column, title: '分类' }),
    meta: { title: '分类' },
    cell: ({ row }) => h('div', { class: 'text-sm' }, row.getValue('cateName') || '-'),
    enableSorting: false,
    enableResizing: true,
  },
  {
    id: 'timeRange',
    header: ({ column }) => h(DataTableColumnHeader<Activity>, { column, title: '活动时间' }),
    meta: { title: '活动时间' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums' }, `${formatTime(row.original.startTime)} ~ ${formatTime(row.original.endTime)}`),
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'isCharge',
    header: ({ column }) => h(DataTableColumnHeader<Activity>, { column, title: '收费' }),
    meta: { title: '收费' },
    cell: ({ row }) => {
      const isCharge = row.getValue('isCharge') as number
      const config = activityChargeConfig[isCharge]
      if (!config)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      return h(Badge, { class: config.style }, () => config.label)
    },
    enableSorting: false,
    enableResizing: true,
  },
  {
    accessorKey: 'isEnable',
    header: ({ column }) => h(DataTableColumnHeader<Activity>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => {
      const isEnable = row.getValue('isEnable') as number
      const config = activityStatusConfig[isEnable]
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
