<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'
import type { FinanceLedger } from '@/services/api/neighborhood-governance.api'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

import DataTableToolbar from './finance-data-table-toolbar.vue'

const props = defineProps<DataTableProps<FinanceLedger>>()

const table = useGenerateVueTable<FinanceLedger>(props)
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
