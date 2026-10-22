<script setup lang="ts">
import { useGetPointGoodsListQuery } from '@/services/api/neighborhood-resident.api'

import { columns } from './point-goods-columns'
import DataTableToolbar from './point-goods-data-table-toolbar.vue'
import DataTable from './point-goods-data-table.vue'

const search = ref('')
const { data, isLoading } = useGetPointGoodsListQuery()

const rows = computed(() => {
  const source = data.value?.data
  const list = [...(Array.isArray(source) ? source : [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  const q = search.value.trim()
  if (!q)
    return list
  return list.filter(row => `${row.name ?? ''}`.includes(q))
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
