<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'
import type { IResidentAiTool } from '@/services/api/resident-ai-tool.api'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

const props = defineProps<DataTableProps<IResidentAiTool>>()

const table = useGenerateVueTable<IResidentAiTool>(props, {
  initialColumnVisibility: {},
})
</script>

<template>
  <DataTable :columns :data :loading :table :server-pagination="serverPagination">
    <template #toolbar>
      <slot name="toolbar" :table="table" />
    </template>
  </DataTable>
</template>
