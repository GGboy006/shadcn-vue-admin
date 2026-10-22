<script setup lang="ts">
import { useGetMailListQuery } from '@/services/api/neighborhood-resident.api'

import { columns } from './mail-columns'
import DataTableToolbar from './mail-data-table-toolbar.vue'
import DataTable from './mail-data-table.vue'

const search = ref('')
const { data, isLoading } = useGetMailListQuery()

const rows = computed(() => {
  const source = data.value?.data
  const list = [...(Array.isArray(source) ? source : [])].sort((a, b) => (b.createTime ?? '').localeCompare(a.createTime ?? ''))
  const q = search.value.trim()
  if (!q)
    return list
  return list.filter(row => `${row.code ?? ''}${row.name ?? ''}${row.content ?? ''}${row.userName ?? ''}`.includes(q))
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
