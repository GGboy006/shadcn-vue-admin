<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'
import type { INeighborhoodSpecial } from '@/services/api/neighborhood-special.api'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

import DataTableToolbar from './data-table-toolbar.vue'

const props = defineProps<DataTableProps<INeighborhoodSpecial>>()

const table = useGenerateVueTable<INeighborhoodSpecial>(props, {
  initialColumnVisibility: {},
})
</script>

<template>
  <DataTable :columns :data :loading :table :server-pagination="serverPagination">
    <template #toolbar>
      <slot name="toolbar" :table="table">
        <DataTableToolbar :table class="w-full" />
      </slot>
    </template>
  </DataTable>
</template>
