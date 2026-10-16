<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'
import type { VillageMember } from '@/services/api/neighborhood-governance.api'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

import DataTableToolbar from './member-data-table-toolbar.vue'

const props = defineProps<DataTableProps<VillageMember>>()

const table = useGenerateVueTable<VillageMember>(props, {
  initialColumnVisibility: { avatar: false },
})
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
