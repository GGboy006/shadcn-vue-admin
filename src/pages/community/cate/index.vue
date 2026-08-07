<route lang="yaml">
meta:
  roles: [3]
</route>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

import type { ICommunityCateListQuery } from '@/services/api/community-cate.api'

import { BasicPage } from '@/components/global-layout'
import { useGetCatePageQuery } from '@/services/api/community-cate.api'

import CateCreate from './components/cate-create.vue'
import { columns } from './components/columns'
import DataTableToolbar from './components/data-table-toolbar.vue'
import DataTable from './components/data-table.vue'

const query = ref<ICommunityCateListQuery>({
  pageNum: 1,
  pageSize: 10,
})

const { data, isLoading } = useGetCatePageQuery(query)

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
const typeFilter = ref<ICommunityCateListQuery['type']>(undefined)

const debouncedUpdateSearch = useDebounceFn((val: string) => {
  query.value.keyword = val || undefined
  query.value.pageNum = 1
}, 300)

watch(search, val => debouncedUpdateSearch(val))

watch(typeFilter, (val) => {
  query.value.type = val
  query.value.pageNum = 1
})

function handleReset() {
  search.value = ''
  typeFilter.value = undefined
  query.value.keyword = undefined
  query.value.type = undefined
  query.value.pageNum = 1
}
</script>

<template>
  <BasicPage
    title="小区分类"
    description="管理小区各类资源分类(社区服务/居委会/物业/生活/服务/商品/AI助手)"
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
          :type-filter="typeFilter"
          @update:search="search = $event"
          @update:type-filter="typeFilter = $event"
          @reset="handleReset"
        />
      </template>
    </DataTable>
  </BasicPage>
</template>
