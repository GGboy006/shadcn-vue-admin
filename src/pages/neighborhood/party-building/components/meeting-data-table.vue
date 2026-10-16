<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'
import type { PartyMeeting } from '@/services/api/neighborhood-governance.api'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

import DataTableToolbar from './meeting-data-table-toolbar.vue'

const props = defineProps<DataTableProps<PartyMeeting>>()

const table = useGenerateVueTable<PartyMeeting>(props)
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
