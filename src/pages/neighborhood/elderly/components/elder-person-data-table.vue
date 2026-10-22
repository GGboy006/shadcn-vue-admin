<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'
import type { ElderPerson } from '@/services/api/neighborhood-resident.api'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

import DataTableToolbar from './elder-person-data-table-toolbar.vue'

const props = defineProps<DataTableProps<ElderPerson>>()

const table = useGenerateVueTable<ElderPerson>(props)
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
