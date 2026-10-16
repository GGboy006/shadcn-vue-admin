<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'
import type { VillageStat } from '@/services/api/neighborhood-governance.api'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

import DataTableToolbar from './stat-data-table-toolbar.vue'

const props = defineProps<DataTableProps<VillageStat>>()

const table = useGenerateVueTable<VillageStat>(props, {
  initialColumnVisibility: { icon: false },
})
</script>

<template>
  <DataTable :columns :data :loading :table>
    <template #toolbar>
      <slot name="toolbar" :table="table">
        <DataTableToolbar :table class="w-full" />
      </slot>
    </template>
  </DataTable>
</template>
