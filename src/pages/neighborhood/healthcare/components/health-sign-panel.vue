<script setup lang="ts">
import { useGetHealthSignListQuery } from '@/services/api/neighborhood-resident.api'

import { columns } from './health-sign-columns'
import DataTableToolbar from './health-sign-data-table-toolbar.vue'
import DataTable from './health-sign-data-table.vue'

const search = ref('')
const { data, isLoading } = useGetHealthSignListQuery()

const rows = computed(() => {
  const source = data.value?.data
  const list = [...(Array.isArray(source) ? source : [])].sort((a, b) => (b.signDate ?? '').localeCompare(a.signDate ?? ''))
  const q = search.value.trim()
  if (!q)
    return list
  return list.filter(row => `${row.userName ?? ''}${row.contactName ?? ''}${row.title ?? ''}`.includes(q))
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
