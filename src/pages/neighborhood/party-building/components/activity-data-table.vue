<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'
import type { PartyActivity } from '@/services/api/neighborhood-governance.api'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

import DataTableToolbar from './activity-data-table-toolbar.vue'

const props = defineProps<DataTableProps<PartyActivity>>()

const table = useGenerateVueTable<PartyActivity>(props)
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
