<route lang="yaml">
meta:
  roles: [3]
</route>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

import type { CommunityMemberOrderPayStatus, CommunityMemberOrderStatus, ICommunityMemberOrderPageQuery } from '@/services/api/community-member-order.api'

import { BasicPage } from '@/components/global-layout'
import { useGetMemberOrderPageQuery } from '@/services/api/community-member-order.api'

import { columns } from './components/columns'
import DataTableToolbar from './components/data-table-toolbar.vue'
import DataTable from './components/data-table.vue'

const query = ref<ICommunityMemberOrderPageQuery>({
  pageNum: 1,
  pageSize: 10,
})

const { data, isLoading } = useGetMemberOrderPageQuery(query)

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
const payStatusFilter = ref('all')
const statusFilter = ref('all')

const debouncedUpdateSearch = useDebounceFn((val: string) => {
  query.value.keyword = val || undefined
  query.value.pageNum = 1
}, 300)

watch(search, val => debouncedUpdateSearch(val))

watch(payStatusFilter, (val) => {
  query.value.payStatus = val === 'all' ? undefined : Number(val) as CommunityMemberOrderPayStatus
  query.value.pageNum = 1
})

watch(statusFilter, (val) => {
  query.value.status = val === 'all' ? undefined : Number(val) as CommunityMemberOrderStatus
  query.value.pageNum = 1
})

function handleReset() {
  search.value = ''
  payStatusFilter.value = 'all'
  statusFilter.value = 'all'
  query.value.keyword = undefined
  query.value.payStatus = undefined
  query.value.status = undefined
  query.value.pageNum = 1
}
</script>

<template>
  <BasicPage
    title="会员订单"
    description="查看本小区会员订单;待支付可取消,购买与退款仍走城市 App"
    sticky
  >
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
          :pay-status-filter="payStatusFilter"
          :status-filter="statusFilter"
          @update:search="search = $event"
          @update:pay-status-filter="payStatusFilter = $event"
          @update:status-filter="statusFilter = $event"
          @reset="handleReset"
        />
      </template>
    </DataTable>
  </BasicPage>
</template>
