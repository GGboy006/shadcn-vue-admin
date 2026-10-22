<script setup lang="ts">
import { useGetVolunteerApplyListQuery } from '@/services/api/neighborhood-resident.api'

import { columns } from './volunteer-apply-columns'
import DataTableToolbar from './volunteer-apply-data-table-toolbar.vue'
import DataTable from './volunteer-apply-data-table.vue'

const search = ref('')
const { data, isLoading } = useGetVolunteerApplyListQuery()

const rows = computed(() => {
  const source = data.value?.data
  const list = [...(Array.isArray(source) ? source : [])].sort((a, b) => (b.createTime ?? '').localeCompare(a.createTime ?? ''))
  const q = search.value.trim()
  if (!q)
    return list
  return list.filter(row => `${row.userName ?? ''}${row.userPhone ?? ''}${row.intro ?? ''}`.includes(q))
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
