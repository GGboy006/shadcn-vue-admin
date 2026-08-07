import type { ColumnDef } from '@tanstack/vue-table'

import { h } from 'vue'

import { Checkbox } from '@/components/ui/checkbox'

import RadioCell from './radio-cell.vue'

const FIXED_WIDTH_COLUMN = {
  size: 32,
  minSize: 32,
  maxSize: 32,
  enableResizing: false,
} as const

export const SelectColumn: ColumnDef<any> = {
  id: 'select',
  ...FIXED_WIDTH_COLUMN,
  header: ({ table }) => h(Checkbox, {
    'modelValue': table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate'),
    'onUpdate:modelValue': value => table.toggleAllPageRowsSelected(!!value),
    'ariaLabel': '全选',
  }),
  cell: ({ row }) => h(Checkbox, {
    'modelValue': row.getIsSelected(),
    'onUpdate:modelValue': value => row.toggleSelected(!!value),
    'ariaLabel': '选择该行',
  }),
  enableSorting: false,
  enableHiding: false,
}

export const RadioSelectColumn: ColumnDef<any> = {
  id: 'radio-select',
  ...FIXED_WIDTH_COLUMN,
  header: () => null,
  cell: ({ row, table }) => h(RadioCell, {
    checked: row.getIsSelected(),
    onClick: (event: MouseEvent) => {
      event.stopPropagation()
      // cancel selection of all rows
      table.toggleAllRowsSelected(false)
      // select the current row
      row.toggleSelected(true)
    },
  }),
  enableSorting: false,
  enableHiding: false,
}
