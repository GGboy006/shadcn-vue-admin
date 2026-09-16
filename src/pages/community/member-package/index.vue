<route lang="yaml">
meta:
  roles: [3]
</route>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

import type { ICommunityMemberPricePageQuery } from '@/services/api/community-member-price.api'

import { BasicPage } from '@/components/global-layout'
import { useGetMemberPricePageQuery } from '@/services/api/community-member-price.api'

import { columns } from './components/columns'
import DataTableToolbar from './components/data-table-toolbar.vue'
import DataTable from './components/data-table.vue'
import PackageCreate from './components/package-create.vue'

const query = ref<ICommunityMemberPricePageQuery>({
  pageNum: 1,
  pageSize: 10,
})

const { data, isLoading } = useGetMemberPricePageQuery(query)

const list = computed(() => data.value?.data?.list ?? [])
const total = computed(() => Number(data.value?.data?.total ?? 0))

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
    title="会员套餐"
    description="维护本小区会员套餐;居民购买与支付走城市 App"
    sticky
  >
    <template #actions>
      <PackageCreate />
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
