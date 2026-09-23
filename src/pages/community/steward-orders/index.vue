<route lang="yaml">
meta:
  roles: [3]
</route>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

import type { HousekeeperOrderPayStatus, HousekeeperOrderStatus, IHousekeeperOrderPageQuery } from '@/services/api/housekeeper-order.api'

import { BasicPage } from '@/components/global-layout'
import { useGetHousekeeperOrderPageQuery } from '@/services/api/housekeeper-order.api'

import { columns } from './components/columns'
import DataTableToolbar from './components/data-table-toolbar.vue'
import DataTable from './components/data-table.vue'

const query = ref<IHousekeeperOrderPageQuery>({
  pageNum: 1,
  pageSize: 10,
})

const { data, isLoading } = useGetHousekeeperOrderPageQuery(query)

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
const orderStatusFilter = ref('all')
const payStatusFilter = ref('all')
const housekeeperIdFilter = ref('all')
const dateBegin = ref<string | undefined>()
const dateEnd = ref<string | undefined>()

const debouncedUpdateSearch = useDebounceFn((val: string) => {
  query.value.keyword = val || undefined
  query.value.pageNum = 1
}, 300)

watch(search, val => debouncedUpdateSearch(val))

watch(orderStatusFilter, (val) => {
  query.value.orderStatus = val === 'all' ? undefined : Number(val) as HousekeeperOrderStatus
  query.value.pageNum = 1
})

watch(payStatusFilter, (val) => {
  query.value.payStatus = val === 'all' ? undefined : Number(val) as HousekeeperOrderPayStatus
  query.value.pageNum = 1
})

watch(housekeeperIdFilter, (val) => {
  query.value.housekeeperId = val === 'all' ? undefined : val
  query.value.pageNum = 1
})

watch(dateBegin, (val) => {
  query.value.createTimeBegin = val ? `${val} 00:00:00` : undefined
  query.value.pageNum = 1
})

watch(dateEnd, (val) => {
  query.value.createTimeEnd = val ? `${val} 23:59:59` : undefined
  query.value.pageNum = 1
})

function handleReset() {
  search.value = ''
  orderStatusFilter.value = 'all'
  payStatusFilter.value = 'all'
  housekeeperIdFilter.value = 'all'
  dateBegin.value = undefined
  dateEnd.value = undefined
  query.value.keyword = undefined
  query.value.orderStatus = undefined
  query.value.payStatus = undefined
  query.value.housekeeperId = undefined
  query.value.createTimeBegin = undefined
  query.value.createTimeEnd = undefined
  query.value.pageNum = 1
}
</script>

<template>
  <BasicPage
    title="服务订单"
    description="查看本站家政订单，取消未支付本地单或改派师傅"
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
          :order-status-filter="orderStatusFilter"
          :pay-status-filter="payStatusFilter"
          :housekeeper-id-filter="housekeeperIdFilter"
          :date-begin="dateBegin"
          :date-end="dateEnd"
          @update:search="search = $event"
          @update:order-status-filter="orderStatusFilter = $event"
          @update:pay-status-filter="payStatusFilter = $event"
          @update:housekeeper-id-filter="housekeeperIdFilter = $event"
          @update:date-begin="dateBegin = $event"
          @update:date-end="dateEnd = $event"
          @reset="handleReset"
        />
      </template>
    </DataTable>
  </BasicPage>
</template>
