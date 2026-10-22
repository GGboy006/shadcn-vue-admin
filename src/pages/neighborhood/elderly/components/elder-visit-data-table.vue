<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'
import type { ElderVisit } from '@/services/api/neighborhood-resident.api'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

import DataTableToolbar from './elder-visit-data-table-toolbar.vue'

const props = defineProps<DataTableProps<ElderVisit>>()

const table = useGenerateVueTable<ElderVisit>(props)
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
