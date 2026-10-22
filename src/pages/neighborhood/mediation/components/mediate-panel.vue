<script setup lang="ts">
import { useGetMediateListQuery } from '@/services/api/neighborhood-resident.api'

import { columns } from './mediate-columns'
import DataTableToolbar from './mediate-data-table-toolbar.vue'
import DataTable from './mediate-data-table.vue'

const search = ref('')
const { data, isLoading } = useGetMediateListQuery()

const rows = computed(() => {
  const source = data.value?.data
  const list = [...(Array.isArray(source) ? source : [])].sort((a, b) => (b.createTime ?? '').localeCompare(a.createTime ?? ''))
  const q = search.value.trim()
  if (!q)
    return list
  return list.filter(row => `${row.userName ?? ''}${row.content ?? ''}${row.typeLabel ?? ''}`.includes(q))
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
