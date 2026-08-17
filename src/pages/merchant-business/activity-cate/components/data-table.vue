<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

import type { ActivityCate } from '../data/schema'

const props = defineProps<DataTableProps<ActivityCate>>()

const table = useGenerateVueTable<ActivityCate>(props, {})
</script>

<template>
  <DataTable :columns :data :loading :table :server-pagination="serverPagination">
    <template #toolbar>
      <slot name="toolbar" :table="table" />
    </template>
  </DataTable>
</template>
