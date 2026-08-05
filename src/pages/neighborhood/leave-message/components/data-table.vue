<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'
import type { INeighborhoodLeaveMessage } from '@/services/api/neighborhood-leave-message.api'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

import DataTableToolbar from './data-table-toolbar.vue'

const props = defineProps<DataTableProps<INeighborhoodLeaveMessage>>()

const table = useGenerateVueTable<INeighborhoodLeaveMessage>(props, {
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
