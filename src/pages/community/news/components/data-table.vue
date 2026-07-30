<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'
import type { ICommunityDynamic } from '@/services/api/community-dynamic.api'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

import DataTableToolbar from './data-table-toolbar.vue'

const props = defineProps<DataTableProps<ICommunityDynamic>>()

const table = useGenerateVueTable<ICommunityDynamic>(props, {
  initialColumnVisibility: {
    original: false,
  },
})
</script>

<template>
  <DataTable :columns :data :loading :table :server-pagination="serverPagination">
    <template #toolbar>
      <slot name="toolbar" :table="table">
        <DataTableToolbar :table class="w-full overflow-x-auto" />
      </slot>
    </template>
  </DataTable>
</template>
