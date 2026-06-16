<script setup lang="ts" generic="T">
import type { Column, Table } from '@tanstack/vue-table'

import { RefreshCcwIcon, Settings2Icon } from '@lucide/vue'

interface DataTableViewOptionsProps {
  table: Table<T>
}

const props = defineProps<DataTableViewOptionsProps>()

const columns = computed(() => props.table.getAllColumns()
  .filter(column => column.getCanHide()))

function resetColumnVisible() {
  columns.value.forEach(column => column.toggleVisibility(true))
}

function getColumnLabel(column: Column<T>) {
  return (column.columnDef.meta as { title?: string } | undefined)?.title ?? column.id
}
</script>

<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <UiButton
        variant="outline"
        size="sm"
        class="hidden h-8 ml-auto lg:flex"
      >
        <Settings2Icon class="size-4 mr-2" />
        列视图
      </UiButton>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end" class="w-[150px]">
      <UiDropdownMenuLabel>切换列</UiDropdownMenuLabel>
      <UiDropdownMenuSeparator />

      <UiDropdownMenuCheckboxItem
        v-for="column in columns"
        :key="column.id"
        class="capitalize"
        :model-value="column.getIsVisible()"
        @update:model-value="(value:boolean) => column.toggleVisibility(!!value)"
      >
        {{ getColumnLabel(column) }}
      </UiDropdownMenuCheckboxItem>

      <UiDropdownMenuSeparator />
      <UiDropdownMenuItem
        class="capitalize"
        @click="resetColumnVisible"
      >
        <RefreshCcwIcon />
        重置
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
