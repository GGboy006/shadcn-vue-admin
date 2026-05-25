<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'

import { XIcon } from '@lucide/vue'

import { DataTableFacetedFilter, DataTableViewOptions } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import type { Task } from '../data/schema'

import { priorities, statuses } from '../data/data'

interface DataTableToolbarProps {
  table: Table<Task>
}

const props = defineProps<DataTableToolbarProps>()

const isFiltered = computed(() => props.table.getState().columnFilters.length > 0)
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex flex-col items-start flex-1 space-y-2 md:items-center md:space-x-2 md:space-y-0 md:flex-row">
      <Input
        placeholder="筛选任务..."
        :model-value="(table.getColumn('title')?.getFilterValue() as string) ?? ''"
        class="h-8 w-[150px] lg:w-[250px]"
        @input="table.getColumn('title')?.setFilterValue($event.target.value)"
      />

      <div class="space-x-2">
        <DataTableFacetedFilter
          v-if="table.getColumn('status')"
          :column="table.getColumn('status')"
          title="状态"
          :options="statuses"
        />
        <DataTableFacetedFilter
          v-if="table.getColumn('priority')"
          :column="table.getColumn('priority')"
          title="优先级"
          :options="priorities"
        />
      </div>

      <Button
        v-if="isFiltered"
        variant="ghost"
        class="h-8 px-2 lg:px-3"
        @click="table.resetColumnFilters()"
      >
        重置
        <XIcon class="size-4" />
      </Button>
    </div>
    <DataTableViewOptions :table="table" />
  </div>
</template>
