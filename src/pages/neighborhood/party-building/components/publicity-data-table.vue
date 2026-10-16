<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'
import type { PartyPublicity } from '@/services/api/neighborhood-governance.api'

import { DataTable, useGenerateVueTable } from '@/components/data-table'

import DataTableToolbar from './publicity-data-table-toolbar.vue'

const props = defineProps<DataTableProps<PartyPublicity>>()

const table = useGenerateVueTable<PartyPublicity>(props, {
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
