<route lang="yaml">
meta:
  roles: [3]
</route>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

import type { ICommunityDynamicListQuery } from '@/services/api/community-dynamic.api'

import { BasicPage } from '@/components/global-layout'
import { useGetDynamicPageQuery } from '@/services/api/community-dynamic.api'

import { columns } from './components/columns'
import DataTableToolbar from './components/data-table-toolbar.vue'
import DataTable from './components/data-table.vue'
import DynamicCreate from './components/dynamic-create.vue'

const query = ref<ICommunityDynamicListQuery>({
  pageNum: 1,
  pageSize: 10,
})

const { data, isLoading } = useGetDynamicPageQuery(query)

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
    title="小区动态"
    description="管理小区内发布的动态资讯"
    sticky
  >
    <template #actions>
      <DynamicCreate />
    </template>
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
