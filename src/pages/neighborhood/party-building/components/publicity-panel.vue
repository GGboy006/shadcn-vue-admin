<script setup lang="ts">
import { useGetPublicityListQuery } from '@/services/api/neighborhood-governance.api'

import { columns } from './publicity-columns'
import DataTableToolbar from './publicity-data-table-toolbar.vue'
import DataTable from './publicity-data-table.vue'

const search = ref('')
const { data, isLoading } = useGetPublicityListQuery()

const rows = computed(() => {
  const source = data.value?.data
  const list = Array.isArray(source) ? source : []
  const q = search.value.trim()
  if (!q)
    return list
  return list.filter(row => `${row.name}${row.typeLabel ?? ''}`.includes(q))
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
