<route lang="yaml">
meta:
  roles: [6]
</route>

<script setup lang="ts">
import { BasicPage } from '@/components/global-layout'
import { useGetFinanceListQuery } from '@/services/api/neighborhood-governance.api'

import { columns } from './components/finance-columns'
import FinanceCreate from './components/finance-create.vue'
import DataTableToolbar from './components/finance-data-table-toolbar.vue'
import DataTable from './components/finance-data-table.vue'

const search = ref('')
const { data, isLoading } = useGetFinanceListQuery()

const rows = computed(() => {
  const source = data.value?.data
  const list = [...(Array.isArray(source) ? source : [])].sort((a, b) => b.month.localeCompare(a.month))
  const q = search.value.trim()
  if (!q)
    return list
  return list.filter(row => `${row.month}${row.content ?? ''}`.includes(q))
})

function reset() {
  search.value = ''
}
</script>

<template>
  <BasicPage title="财务公开" description="按月登记收支，结余由接口计算" sticky>
    <template #actions>
      <FinanceCreate />
    </template>

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
  </BasicPage>
</template>
