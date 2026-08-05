import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { INeighborhoodSpecialArticle } from '@/services/api/neighborhood-special-article.api'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'
import {
  specialArticleContentTypeConfig,
  specialArticleEnableStatusConfig,
  specialArticleTypeConfig,
} from '@/services/api/neighborhood-special-article.api'

import DataTableRowActions from './data-table-row-actions.vue'

export function createColumns(specialCode: string): ColumnDef<INeighborhoodSpecialArticle>[] {
  return [
    SelectColumn as ColumnDef<INeighborhoodSpecialArticle>,
    {
      accessorKey: 'poster',
      header: ({ column }) => h(DataTableColumnHeader<INeighborhoodSpecialArticle>, { column, title: '封面' }),
      meta: { title: '封面' },
      cell: ({ row }) => {
        const poster = row.original.poster
        if (!poster)
          return h('div', { class: 'text-sm text-muted-foreground' }, '-')
        return h('img', { src: poster, alt: '封面', class: 'h-10 w-16 rounded border object-cover' })
      },
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
    },
    {
      accessorKey: 'title',
      header: ({ column }) => h(DataTableColumnHeader<INeighborhoodSpecialArticle>, { column, title: '标题' }),
      meta: { title: '标题' },
      cell: ({ row }) => h('div', { class: 'max-w-[240px] truncate text-sm font-medium' }, row.getValue('title') || '-'),
      enableSorting: false,
      enableHiding: false,
      enableResizing: true,
    },
    {
      accessorKey: 'articleType',
      header: ({ column }) => h(DataTableColumnHeader<INeighborhoodSpecialArticle>, { column, title: '文章类型' }),
      meta: { title: '文章类型' },
      cell: ({ row }) => {
        const type = row.original.articleType
        if (type === undefined || type === null)
          return h('div', { class: 'text-sm text-muted-foreground' }, '-')
        const config = specialArticleTypeConfig[type]
        if (!config)
          return null
        return h(Badge, { variant: config.variant }, () => config.label)
      },
      enableSorting: false,
      enableHiding: true,
      enableResizing: true,
    },
    {
      accessorKey: 'contentType',
      header: ({ column }) => h(DataTableColumnHeader<INeighborhoodSpecialArticle>, { column, title: '内容类型' }),
      meta: { title: '内容类型' },
      cell: ({ row }) => {
        const contentType = row.original.contentType
        if (contentType === undefined || contentType === null)
          return h('div', { class: 'text-sm text-muted-foreground' }, '-')
        const config = specialArticleContentTypeConfig[contentType]
        if (!config)
          return null
        return h(Badge, { variant: config.variant }, () => config.label)
      },
      enableSorting: false,
      enableHiding: true,
      enableResizing: true,
    },
    {
      accessorKey: 'authorName',
      header: ({ column }) => h(DataTableColumnHeader<INeighborhoodSpecialArticle>, { column, title: '作者' }),
      meta: { title: '作者' },
      cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.getValue('authorName') || '-'),
      enableSorting: false,
      enableHiding: true,
      enableResizing: true,
    },
    {
      accessorKey: 'isEnable',
      header: ({ column }) => h(DataTableColumnHeader<INeighborhoodSpecialArticle>, { column, title: '启用状态' }),
      meta: { title: '启用状态' },
      cell: ({ row }) => {
        const isEnable = row.original.isEnable
        if (isEnable === undefined || isEnable === null)
          return h('div', { class: 'text-sm text-muted-foreground' }, '-')
        const config = specialArticleEnableStatusConfig[isEnable]
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
      header: ({ column }) => h(DataTableColumnHeader<INeighborhoodSpecialArticle>, { column, title: '创建时间' }),
      meta: { title: '创建时间' },
      cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground tabular-nums' }, row.getValue('createTime') || '-'),
      enableSorting: false,
      enableHiding: true,
      enableResizing: true,
    },
    {
      id: 'actions',
      cell: ({ row }) => h(DataTableRowActions, { row, specialCode }),
      enableHiding: false,
    },
  ]
}
