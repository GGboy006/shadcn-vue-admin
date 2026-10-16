<script setup lang="ts">
import { useGetMemberListQuery } from '@/services/api/neighborhood-governance.api'

import { columns } from './member-columns'
import DataTableToolbar from './member-data-table-toolbar.vue'
import DataTable from './member-data-table.vue'

const search = ref('')
const { data, isLoading } = useGetMemberListQuery()

const rows = computed(() => {
  const source = data.value?.data
  const list = [...(Array.isArray(source) ? source : [])].sort((a, b) => a.sortOrder - b.sortOrder)
  const q = search.value.trim()
  if (!q)
    return list
  return list.filter(row => `${row.name}${row.title}${row.phone ?? ''}`.includes(q))
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
