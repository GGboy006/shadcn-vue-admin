import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { IResident } from '@/services/api/resident.api'

import { DataTableColumnHeader, DataTableImageCell, SelectColumn } from '@/components/data-table'
import PropPiCopy from '@/components/prop-ui/copy/Copy.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import {
  residentEnableStatusConfig,
  residentIdentityTypeConfig,
  residentMemberStatusConfig,
  residentMemberStatusText,
  residentVerifyStatusConfig,
} from '@/services/api/resident.api'

import { formatDateTime } from '../data/format'
import DataTableRowActions from './data-table-row-actions.vue'

/** 拼接楼栋-单元-房间地址 */
function formatAddress(row: IResident): string {
  const parts = [row.buildingNo, row.unitNo, row.roomNo].filter(Boolean)
  return parts.join('-') || row.doorplate || ''
}

export const columns: ColumnDef<IResident>[] = [
  SelectColumn as ColumnDef<IResident>,
  {
    accessorKey: 'avatar',
    header: ({ column }) => h(DataTableColumnHeader<IResident>, { column, title: '头像' }),
    meta: { title: '头像' },
    cell: ({ row }) => h(DataTableImageCell, { src: row.original.avatar, alt: row.original.nickname || '头像', shape: 'circle' }),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'nickname',
    header: ({ column }) => h(DataTableColumnHeader<IResident>, { column, title: '昵称' }),
    meta: { title: '昵称' },
    cell: ({ row }) => h('div', { class: 'max-w-[140px] truncate text-sm font-medium' }, row.original.nickname || '-'),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },

  {
    accessorKey: 'phone',
    header: ({ column }) => h(DataTableColumnHeader<IResident>, { column, title: '手机' }),
    meta: { title: '手机' },
    cell: ({ row }) => {
      const phone = row.original.phone
      if (!phone)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      return h('div', { class: 'flex items-center gap-1' }, [
        h('span', { class: 'text-sm text-muted-foreground' }, phone),
        h(PropPiCopy, {
          content: phone,
          size: 'sm',
          variant: 'ghost',
          copyTooltipText: '复制手机号',
          copiedTooltipText: '已复制',
        }),
      ])
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'identityType',
    header: ({ column }) => h(DataTableColumnHeader<IResident>, { column, title: '身份' }),
    meta: { title: '身份' },
    cell: ({ row }) => {
      const identityType = row.original.identityType
      if (identityType === undefined || identityType === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = residentIdentityTypeConfig[identityType]
      if (!config)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      return h(Badge, { variant: config.variant }, () => config.label)
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'verifyStatus',
    header: ({ column }) => h(DataTableColumnHeader<IResident>, { column, title: '认证状态' }),
    meta: { title: '认证状态' },
    cell: ({ row }) => {
      const verifyStatus = row.original.verifyStatus
      if (verifyStatus === undefined || verifyStatus === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = residentVerifyStatusConfig[verifyStatus]
      if (!config)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      return h(Badge, { variant: config.variant }, () => config.label)
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'memberStatus',
    header: ({ column }) => h(DataTableColumnHeader<IResident>, { column, title: '会员状态' }),
    meta: { title: '会员状态' },
    cell: ({ row }) => {
      const memberStatus = row.original.memberStatus
      if (memberStatus === undefined || memberStatus === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = residentMemberStatusConfig[memberStatus]
      return h(Badge, { variant: config?.variant ?? 'secondary' }, () => residentMemberStatusText(memberStatus))
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'memberExpireTime',
    header: ({ column }) => h(DataTableColumnHeader<IResident>, { column, title: '会员到期' }),
    meta: { title: '会员到期' },
    cell: ({ row }) => h('div', { class: 'text-sm tabular-nums text-muted-foreground' }, formatDateTime(row.original.memberExpireTime)),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    id: 'address',
    header: ({ column }) => h(DataTableColumnHeader<IResident>, { column, title: '楼栋门牌' }),
    meta: { title: '楼栋门牌' },
    cell: ({ row }) => h('div', { class: 'max-w-[160px] truncate text-sm text-muted-foreground' }, formatAddress(row.original) || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'aiToolCount',
    header: ({ column }) => h(DataTableColumnHeader<IResident>, { column, title: 'AI使用次数' }),
    meta: { title: 'AI使用次数' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.original.aiToolCount ?? 0),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'status',
    header: ({ column }) => h(DataTableColumnHeader<IResident>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => {
      const status = row.original.status
      if (status === undefined || status === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = residentEnableStatusConfig[status]
      if (!config)
        return null
      return h(Badge, { variant: config.variant }, () => config.label)
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'lastActiveTime',
    header: ({ column }) => h(DataTableColumnHeader<IResident>, { column, title: '最近活跃' }),
    meta: { title: '最近活跃' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.original.lastActiveTime || '-'),
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
