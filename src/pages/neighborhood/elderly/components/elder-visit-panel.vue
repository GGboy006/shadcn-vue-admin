<script setup lang="ts">
import { useGetElderVisitListQuery } from '@/services/api/neighborhood-resident.api'

import { columns } from './elder-visit-columns'
import DataTableToolbar from './elder-visit-data-table-toolbar.vue'
import DataTable from './elder-visit-data-table.vue'

const search = ref('')
const { data, isLoading } = useGetElderVisitListQuery()

const rows = computed(() => {
  const source = data.value?.data
  const list = [...(Array.isArray(source) ? source : [])].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
  const q = search.value.trim()
  if (!q)
    return list
  return list.filter(row => `${row.name ?? ''}${row.address ?? ''}${row.contactName ?? ''}`.includes(q))
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
