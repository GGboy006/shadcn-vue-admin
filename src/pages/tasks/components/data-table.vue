<script setup lang="ts">
import { Trash2Icon } from '@lucide/vue'

import type { DataTableProps } from '@/components/data-table'

import { DataTable, DataTableBulkActions, useGenerateVueTable } from '@/components/data-table'

import type { Task } from '../data/schema'

import DataTableToolbar from './data-table-toolbar.vue'
import TaskDeleteBatch from './task-delete-batch.vue'

const props = defineProps<DataTableProps<Task>>()
const table = useGenerateVueTable<Task>(props)

const taskDeleteBatchOpen = ref(false)
</script>

<template>
  <DataTableBulkActions entity-name="任务" :table="table">
    <UiTooltip>
      <UiTooltipTrigger as-child>
        <UiButton
          variant="destructive"
          size="icon"
          class="size-8"
          aria-label="删除选中的任务"
          title="删除选中的任务"
          @click="taskDeleteBatchOpen = true"
        >
          <Trash2Icon />
          <span class="sr-only">删除选中的任务</span>
        </UiButton>
      </UiTooltipTrigger>
      <UiTooltipContent>
        <p>删除选中的任务</p>
      </UiTooltipContent>
    </UiTooltip>

    <TaskDeleteBatch
      v-model:open="taskDeleteBatchOpen"
      :table
    />
  </DataTableBulkActions>

  <DataTable :columns :table :data :loading>
    <template #toolbar>
      <DataTableToolbar :table="table" class="w-full overflow-x-auto" />
    </template>
  </DataTable>
</template>
