<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'
import type { EnvCompare } from '@/services/api/neighborhood-resident.api'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

import DataTableToolbar from './env-compare-data-table-toolbar.vue'

const props = defineProps<DataTableProps<EnvCompare>>()

const table = useGenerateVueTable<EnvCompare>(props, {
  initialColumnVisibility: { poster: false, logo: false },
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
