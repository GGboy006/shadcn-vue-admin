<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'
import type { Volunteer } from '@/services/api/neighborhood-resident.api'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

import DataTableToolbar from './volunteer-data-table-toolbar.vue'

const props = defineProps<DataTableProps<Volunteer>>()

const table = useGenerateVueTable<Volunteer>(props)
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
