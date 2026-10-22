<script setup lang="ts">
import { useGetFireArticleListQuery } from '@/services/api/neighborhood-resident.api'

import { columns } from './fire-article-columns'
import DataTableToolbar from './fire-article-data-table-toolbar.vue'
import DataTable from './fire-article-data-table.vue'

const search = ref('')
const { data, isLoading } = useGetFireArticleListQuery()

const rows = computed(() => {
  const source = data.value?.data
  const list = [...(Array.isArray(source) ? source : [])].sort((a, b) => (b.updateTime ?? '').localeCompare(a.updateTime ?? ''))
  const q = search.value.trim()
  if (!q)
    return list
  return list.filter(row => `${row.name ?? ''}${row.remark ?? ''}`.includes(q))
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
