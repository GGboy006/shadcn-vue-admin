<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'
import type { INeighborhoodActivity } from '@/services/api/neighborhood-activity.api'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

import DataTableToolbar from './data-table-toolbar.vue'

const props = defineProps<DataTableProps<INeighborhoodActivity>>()

const table = useGenerateVueTable<INeighborhoodActivity>(props, {
  initialColumnVisibility: {},
})
</script>

<template>
  <DataTable :columns :data :loading :table :server-pagination="serverPagination">
    <template #toolbar>
      <slot name="toolbar" :table="table">
        <DataTableToolbar :table class="w-full overflow-x-auto" />
      </slot>
    </template>
  </DataTable>
</template>
