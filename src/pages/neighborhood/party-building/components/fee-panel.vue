<script setup lang="ts">
import { useGetFeeListQuery } from '@/services/api/neighborhood-governance.api'

import { columns } from './fee-columns'
import DataTableToolbar from './fee-data-table-toolbar.vue'
import DataTable from './fee-data-table.vue'

const search = ref('')
const { data, isLoading } = useGetFeeListQuery()

const rows = computed(() => {
  const source = data.value?.data
  const list = Array.isArray(source) ? source : []
  const q = search.value.trim()
  if (!q)
    return list
  return list.filter(row => row.name.includes(q))
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
