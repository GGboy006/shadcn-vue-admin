<script setup lang="ts">
import { useGetEnvCompareListQuery } from '@/services/api/neighborhood-resident.api'

import { columns } from './env-compare-columns'
import DataTableToolbar from './env-compare-data-table-toolbar.vue'
import DataTable from './env-compare-data-table.vue'

const search = ref('')
const { data, isLoading } = useGetEnvCompareListQuery()

const rows = computed(() => {
  const source = data.value?.data
  const list = [...(Array.isArray(source) ? source : [])].sort((a, b) => (b.signDate ?? '').localeCompare(a.signDate ?? ''))
  const q = search.value.trim()
  if (!q)
    return list
  return list.filter(row => `${row.name ?? ''}${row.address ?? ''}`.includes(q))
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
