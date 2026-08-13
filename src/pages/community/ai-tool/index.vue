<route lang="yaml">
meta:
  roles: [3]
</route>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

import type { IResidentAiToolCateListQuery } from '@/services/api/resident-ai-tool.api'

import { BasicPage } from '@/components/global-layout'
import { useGetResidentAiToolCatePageQuery } from '@/services/api/resident-ai-tool.api'

import CateCreate from './components/cate-create.vue'
import { columns } from './components/columns'
import DataTableToolbar from './components/data-table-toolbar.vue'
import DataTable from './components/data-table.vue'

const query = ref<IResidentAiToolCateListQuery>({
  pageNum: 1,
  pageSize: 10,
})

const { data, isLoading } = useGetResidentAiToolCatePageQuery(query)

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
  query.value.keyword = undefined
  query.value.pageNum = 1
}
</script>

<template>
  <BasicPage
    title="居民AI工具"
    description="管理AI工具分类,并按分类为全小区居民配置可用的AI工具"
    sticky
  >
    <template #actions>
      <CateCreate />
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
