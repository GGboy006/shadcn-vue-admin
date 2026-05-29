<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

import type { Merchant } from '../data/schema'

import DataTableToolbar from './data-table-toolbar.vue'

const props = defineProps<DataTableProps<Merchant>>()

const table = useGenerateVueTable<Merchant>(props, {
  initialColumnVisibility: {
    merchantCode: false,
    businessStatus: false,
    address: false,
  },
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
