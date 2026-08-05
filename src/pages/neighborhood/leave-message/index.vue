<route lang="yaml">
meta:
  roles: [6]
</route>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

import type { INeighborhoodLeaveMessageListQuery } from '@/services/api/neighborhood-leave-message.api'

import { BasicPage } from '@/components/global-layout'
import { useGetLeaveMessagePageQuery } from '@/services/api/neighborhood-leave-message.api'

import { columns } from './components/columns'
import DataTableToolbar from './components/data-table-toolbar.vue'
import DataTable from './components/data-table.vue'

const query = ref<INeighborhoodLeaveMessageListQuery>({
  pageNum: 1,
  pageSize: 10,
})

const { data, isLoading } = useGetLeaveMessagePageQuery(query)

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
    title="在线留言"
    description="查看居民提交的留言"
    sticky
  >
    <div class="overflow-x-auto">
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
    </div>
  </BasicPage>
</template>
