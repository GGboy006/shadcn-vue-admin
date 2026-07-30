<route lang="yaml">
meta:
  roles: [3]
</route>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

import type { IMerchantListQuery } from '@/services/api/merchant.api'

import { BasicPage } from '@/components/global-layout'
import { useGetMerchantListQuery } from '@/services/api/merchant.api'

import { columns } from './components/columns'
import DataTableToolbar from './components/data-table-toolbar.vue'
import DataTable from './components/data-table.vue'
import MerchantCreate from './components/merchant-create.vue'

const query = ref<IMerchantListQuery>({
  pageNum: 1,
  pageSize: 10,
  type: '4',
})

const { data, isLoading } = useGetMerchantListQuery(query)

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
const status = ref<string | undefined>(undefined)

const debouncedUpdateSearch = useDebounceFn((val: string) => {
  query.value.merchantName = val || undefined
  query.value.pageNum = 1
}, 300)

watch(search, val => debouncedUpdateSearch(val))
watch(status, (val) => {
  query.value.status = val
  query.value.pageNum = 1
})

function handleReset() {
  search.value = ''
  status.value = undefined
  query.value.pageNum = 1
}
</script>

<template>
  <BasicPage
    title="商户管理"
    description="管理小区内的商户账号"
    sticky
  >
    <template #actions>
      <MerchantCreate :type="4" />
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
            :status="status"
            @update:search="search = $event"
            @update:status="status = $event"
            @reset="handleReset"
          />
        </template>
      </DataTable>
    </div>
  </BasicPage>
</template>
