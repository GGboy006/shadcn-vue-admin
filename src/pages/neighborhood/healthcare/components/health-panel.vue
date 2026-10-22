<script setup lang="ts">
import { useGetHealthListQuery } from '@/services/api/neighborhood-resident.api'

import { columns } from './health-columns'
import DataTableToolbar from './health-data-table-toolbar.vue'
import DataTable from './health-data-table.vue'

const search = ref('')
const { data, isLoading } = useGetHealthListQuery()

const rows = computed(() => {
  const source = data.value?.data
  const list = [...(Array.isArray(source) ? source : [])].sort((a, b) => (b.signDate ?? '').localeCompare(a.signDate ?? ''))
  const q = search.value.trim()
  if (!q)
    return list
  return list.filter(row => `${row.userName ?? ''}${row.code ?? ''}`.includes(q))
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
