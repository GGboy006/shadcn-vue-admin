<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'
import type { Affair } from '@/services/api/neighborhood-resident.api'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

import DataTableToolbar from './affair-data-table-toolbar.vue'

const props = defineProps<DataTableProps<Affair>>()

const table = useGenerateVueTable<Affair>(props)
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
