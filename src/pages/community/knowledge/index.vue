<route lang="yaml">
meta:
  roles: [3]
</route>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

import type { IKnowledgeCategoryListQuery } from '@/services/api/knowledge.api'

import { BasicPage } from '@/components/global-layout'
import { useGetKnowledgeCategoryPageQuery } from '@/services/api/knowledge.api'

import CategoryCreate from './components/category/category-create.vue'
import { columns } from './components/category/columns'
import DataTableToolbar from './components/category/data-table-toolbar.vue'
import DataTable from './components/category/data-table.vue'

const query = ref<IKnowledgeCategoryListQuery>({
  pageNum: 1,
  pageSize: 10,
})

const { data, isLoading } = useGetKnowledgeCategoryPageQuery(query)

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
const categoryTypeFilter = ref<IKnowledgeCategoryListQuery['categoryType']>(undefined)
const statusFilter = ref<IKnowledgeCategoryListQuery['status']>(undefined)

const debouncedUpdateSearch = useDebounceFn((val: string) => {
  query.value.categoryName = val || undefined
  query.value.pageNum = 1
}, 300)

watch(search, val => debouncedUpdateSearch(val))

watch(categoryTypeFilter, (val) => {
  query.value.categoryType = val
  query.value.pageNum = 1
})

watch(statusFilter, (val) => {
  query.value.status = val
  query.value.pageNum = 1
})

function handleReset() {
  search.value = ''
  categoryTypeFilter.value = undefined
  statusFilter.value = undefined
  query.value.categoryName = undefined
  query.value.categoryType = undefined
  query.value.status = undefined
  query.value.pageNum = 1
}
</script>

<template>
  <BasicPage
    title="知识服务"
    description="管理知识分类、文章与快捷问答"
    sticky
  >
    <template #actions>
      <CategoryCreate />
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
          :category-type-filter="categoryTypeFilter"
          :status-filter="statusFilter"
          @update:search="search = $event"
          @update:category-type-filter="categoryTypeFilter = $event"
          @update:status-filter="statusFilter = $event"
          @reset="handleReset"
        />
      </template>
    </DataTable>
  </BasicPage>
</template>
