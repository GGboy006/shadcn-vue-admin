<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

import type { Activity } from '../data/schema'

const props = defineProps<DataTableProps<Activity>>()

const table = useGenerateVueTable<Activity>(props, {})
</script>

<template>
  <DataTable :columns :data :loading :table :server-pagination="serverPagination">
    <template #toolbar>
      <slot name="toolbar" :table="table" />
    </template>
  </DataTable>
</template>
