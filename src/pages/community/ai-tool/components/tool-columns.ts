import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import type { IResidentAiTool } from '@/services/api/resident-ai-tool.api'

import { DataTableColumnHeader } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'
import { residentAiToolEnableStatusConfig } from '@/services/api/resident-ai-tool.api'

/**
 * 已配置工具列表列定义(对接文档 §4.1 / §4.4 ResidentAiToolVO)。
 *
 * 这是「配置结果」视图,只读:增删一律回到分类的「配置工具」页走全量覆盖,
 * 故不提供行操作列。`otherCode` 有值即说明后端同步城市服务成功。
 */
export const toolColumns: ColumnDef<IResidentAiTool>[] = [
  {
    accessorKey: 'skillName',
    header: ({ column }) => h(DataTableColumnHeader<IResidentAiTool>, { column, title: '工具名称' }),
    meta: { title: '工具名称' },
    cell: ({ row }) => {
      const { skillIcon, skillName, name } = row.original
      const label = skillName || name || '-'
      return h('div', { class: 'flex items-center gap-2' }, [
        skillIcon
          ? h('img', {
              src: skillIcon,
              alt: '',
              class: 'size-6 shrink-0 rounded object-cover',
            })
          : null,
        h('span', { class: 'max-w-[200px] truncate text-sm font-medium' }, label),
      ])
    },
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },

  {
    accessorKey: 'cateName',
    header: ({ column }) => h(DataTableColumnHeader<IResidentAiTool>, { column, title: '所属分类' }),
    meta: { title: '所属分类' },
    cell: ({ row }) => h(
      'div',
      { class: 'max-w-[160px] truncate text-sm' },
      row.original.cateName || row.original.cateCode || '-',
    ),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'describe',
    header: ({ column }) => h(DataTableColumnHeader<IResidentAiTool>, { column, title: '描述' }),
    meta: { title: '描述' },
    cell: ({ row }) => h(
      'div',
      { class: 'max-w-[260px] truncate text-sm text-muted-foreground' },
      row.original.describe || '-',
    ),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'isEnable',
    header: ({ column }) => h(DataTableColumnHeader<IResidentAiTool>, { column, title: '状态' }),
    meta: { title: '状态' },
    cell: ({ row }) => {
      const isEnable = row.original.isEnable
      if (isEnable === undefined || isEnable === null)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      const config = residentAiToolEnableStatusConfig[isEnable]
      if (!config)
        return h('div', { class: 'text-sm text-muted-foreground' }, '-')
      return h(Badge, { variant: config.variant }, () => config.label)
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'otherCode',
    header: ({ column }) => h(DataTableColumnHeader<IResidentAiTool>, { column, title: '城市服务标识' }),
    meta: { title: '城市服务标识' },
    cell: ({ row }) => {
      const otherCode = row.original.otherCode
      if (!otherCode)
        return h(Badge, { variant: 'outline' }, () => '未同步')
      return h(
        'div',
        { class: 'max-w-[180px] truncate font-mono text-xs text-muted-foreground' },
        otherCode,
      )
    },
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },

  {
    accessorKey: 'createTime',
    header: ({ column }) => h(DataTableColumnHeader<IResidentAiTool>, { column, title: '配置时间' }),
    meta: { title: '配置时间' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, row.original.createTime || '-'),
    enableSorting: false,
    enableHiding: true,
    enableResizing: true,
  },
]
