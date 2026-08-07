<route lang="yaml">
meta:
  roles: [3]
</route>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

import type { ICommunityColumnListQuery } from '@/services/api/community-column.api'

import { BasicPage } from '@/components/global-layout'
import { useGetColumnPageQuery } from '@/services/api/community-column.api'

import ColumnCreate from './components/column-create.vue'
import { columns } from './components/columns'
import DataTableToolbar from './components/data-table-toolbar.vue'
import DataTable from './components/data-table.vue'

const query = ref<ICommunityColumnListQuery>({
  pageNum: 1,
  pageSize: 10,
})

const { data, isLoading } = useGetColumnPageQuery(query)

const list = computed(() => data.value?.data?.list ?? [])
const total = computed(() => data.value?.data?.total ?? 0)

const serverPagination = computed(() => ({
  page: query.value.pageNum,
  pageSize: query.value.pageSize,
  total: total.value,
  onPageChange: (page: number) => {
    query.value.pageNum = page
  },
  onPageSizeChange: (pageSize: number) => {
    query.value.pageSize = pageSize
    query.value.pageNum = 1
  },
}))

const search = ref('')

const debouncedUpdateSearch = useDebounceFn((val: string) => {
  query.value.keyword = val || undefined
  query.value.pageNum = 1
}, 300)

watch(search, val => debouncedUpdateSearch(val))

function handleReset() {
  search.value = ''
  query.value.pageNum = 1
}
</script>

<template>
  <BasicPage
    title="小区栏目"
    description="管理小区 App 首页栏目入口"
    sticky
  >
    <template #actions>
      <ColumnCreate />
    </template>
    <DataTable
      :loading="isLoading"
      :data="list"
      :columns="columns"
      :server-pagination="serverPagination"
    >
      <template #toolbar="{ table }">
        <DataTableToolbar
          :table="table"
          :search="search"
          @update:search="search = $event"
          @reset="handleReset"
        />
      </template>
    </DataTable>
  </BasicPage>
</template>
