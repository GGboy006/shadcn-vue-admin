import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'
import { RouterLink } from 'vue-router'

import type { INeighborhoodSpecial } from '@/services/api/neighborhood-special.api'

import { DataTableColumnHeader, DataTableImageCell, SelectColumn } from '@/components/data-table'
import { Copy } from '@/components/prop-ui/copy'
import Badge from '@/components/ui/badge/Badge.vue'
import { specialEnableStatusConfig } from '@/services/api/neighborhood-special.api'

import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<INeighborhoodSpecial>[] = [
  SelectColumn as ColumnDef<INeighborhoodSpecial>,
  {
    accessorKey: 'poster',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodSpecial>, { column, title: '封面' }),
    meta: { title: '封面' },
    cell: ({ row }) => h(DataTableImageCell, { src: row.original.poster, alt: '封面', size: 'h-10 w-16' }),
    enableSorting: false,
    enableHiding: true,
    enableResizing: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodSpecial>, { column, title: '专题名称' }),
    meta: { title: '专题名称' },
    cell: ({ row }) => h(
      RouterLink,
      {
        to: `/neighborhood/special/${row.original.uniqueCode}/article`,
        class: 'max-w-[200px] truncate block text-left text-sm font-medium text-primary hover:underline cursor-pointer',
        title: `查看「${row.original.name}」下的文章`,
      },
      () => row.getValue('name') || '-',
    ),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  {
    accessorKey: 'uniqueCode',
    header: ({ column }) => h(DataTableColumnHeader<INeighborhoodSpecial>, { column, title: '专题编码' }),
    meta: { title: '专题编码' },
    cell: ({ row }) => {
      const uniqueCode = row.original.uniqueCode
      if (!uniqueCode)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      return h('div', { class: 'flex items-center gap-1' }, [
        h('span', { class: 'max-w-[180px] truncate font-mono text-xs text-muted-foreground' }, uniqueCode),
        h(Copy, {
          content: uniqueCode,
          size: 'sm',
          variant: 'ghost',
          copyTooltipText: '复制专题编码',
          copiedTooltipText: '已复制',
        }),
      ])
    },
    enableSorting: false,
    enableHiding: true,
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
