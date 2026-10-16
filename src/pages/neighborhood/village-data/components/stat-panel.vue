<script setup lang="ts">
import { useGetStatListQuery } from '@/services/api/neighborhood-governance.api'

import { columns } from './stat-columns'
import DataTableToolbar from './stat-data-table-toolbar.vue'
import DataTable from './stat-data-table.vue'

const search = ref('')
const { data, isLoading } = useGetStatListQuery()

const rows = computed(() => {
  const source = data.value?.data
  const list = [...(Array.isArray(source) ? source : [])].sort((a, b) => a.sortOrder - b.sortOrder)
  const q = search.value.trim()
  if (!q)
    return list
  return list.filter(row => `${row.statName}${row.statValue ?? ''}${row.unit ?? ''}${row.statCode}`.includes(q))
})

function reset() {
  search.value = ''
}
</script>

<template>
  <DataTable :loading="isLoading" :data="rows" :columns="columns">
    <template #toolbar="{ table }">
      <DataTableToolbar
        :table="table"
        :search="search"
        @update:search="search = $event"
        @reset="reset"
      />
    </template>
  </DataTable>
</template>
