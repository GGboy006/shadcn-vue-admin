<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'
import type { INeighborhoodBanner } from '@/services/api/neighborhood-banner.api'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

import DataTableToolbar from './data-table-toolbar.vue'

const props = defineProps<DataTableProps<INeighborhoodBanner>>()

const table = useGenerateVueTable<INeighborhoodBanner>(props, {
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
