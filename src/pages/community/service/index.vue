<route lang="yaml">
meta:
  roles: [3]
</route>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

import type { ICommunityServiceListQuery } from '@/services/api/community-service.api'

import { BasicPage } from '@/components/global-layout'
import { useGetServicePageQuery } from '@/services/api/community-service.api'

import { columns } from './components/columns'
import DataTableToolbar from './components/data-table-toolbar.vue'
import DataTable from './components/data-table.vue'
import ServiceCreate from './components/service-create.vue'
// 小程序预览未完成，暂不挂载；组件保留：service-phone-preview.vue / phone-frame.vue
// import ServicePhonePreview from './components/service-phone-preview.vue'

const query = ref<ICommunityServiceListQuery>({
  pageNum: 1,
  pageSize: 10,
})

const { data, isLoading } = useGetServicePageQuery(query)

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
const typeFilter = ref<ICommunityServiceListQuery['type']>(undefined)

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
    title="小区服务"
    description="管理小区服务入口(小程序/H5/阅览室/商户/AI助手/商品等)"
    sticky
  >
    <template #actions>
      <ServiceCreate />
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
