<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'
import type { PartyFee } from '@/services/api/neighborhood-governance.api'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

import DataTableToolbar from './fee-data-table-toolbar.vue'

const props = defineProps<DataTableProps<PartyFee>>()

const table = useGenerateVueTable<PartyFee>(props)
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
