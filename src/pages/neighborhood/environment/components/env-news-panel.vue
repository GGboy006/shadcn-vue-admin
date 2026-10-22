<script setup lang="ts">
import { useGetEnvNewsListQuery } from '@/services/api/neighborhood-resident.api'

import { columns } from './env-news-columns'
import DataTableToolbar from './env-news-data-table-toolbar.vue'
import DataTable from './env-news-data-table.vue'

const search = ref('')
const { data, isLoading } = useGetEnvNewsListQuery()

const rows = computed(() => {
  const source = data.value?.data
  const list = [...(Array.isArray(source) ? source : [])].sort((a, b) => (b.signDate ?? '').localeCompare(a.signDate ?? ''))
  const q = search.value.trim()
  if (!q)
    return list
  return list.filter(row => `${row.name ?? ''}${row.describes ?? ''}`.includes(q))
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
