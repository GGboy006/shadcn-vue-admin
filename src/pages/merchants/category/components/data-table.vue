<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

import type { MerchantCategory } from '../data/schema'

const props = defineProps<DataTableProps<MerchantCategory>>()

const table = useGenerateVueTable<MerchantCategory>(props, {})
</script>

<template>
  <DataTable :columns :data :loading :table :server-pagination="serverPagination">
    <template #toolbar>
      <slot name="toolbar" :table="table" />
    </template>
  </DataTable>
</template>
