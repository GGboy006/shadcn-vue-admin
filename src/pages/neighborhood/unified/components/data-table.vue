<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'
import type { INeighborhoodUnified } from '@/services/api/neighborhood-unified.api'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

import DataTableToolbar from './data-table-toolbar.vue'

const props = defineProps<DataTableProps<INeighborhoodUnified>>()

const table = useGenerateVueTable<INeighborhoodUnified>(props, {
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
