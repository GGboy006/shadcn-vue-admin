<route lang="yaml">
meta:
  roles: [3]
</route>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

import type { IResidentListQuery } from '@/services/api/resident.api'

import { BasicPage } from '@/components/global-layout'
import { useGetResidentPageQuery } from '@/services/api/resident.api'

import { columns } from './components/columns'
import DataTableToolbar from './components/data-table-toolbar.vue'
import DataTable from './components/data-table.vue'

const query = ref<IResidentListQuery>({
  pageNum: 1,
  pageSize: 10,
})

const { data, isLoading } = useGetResidentPageQuery(query)

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
const identityTypeFilter = ref<IResidentListQuery['identityType']>(undefined)
const verifyStatusFilter = ref<IResidentListQuery['verifyStatus']>(undefined)
const statusFilter = ref<IResidentListQuery['status']>(undefined)

const debouncedUpdateSearch = useDebounceFn((val: string) => {
  query.value.keyword = val || undefined
  query.value.pageNum = 1
}, 300)

watch(search, val => debouncedUpdateSearch(val))

watch(identityTypeFilter, (val) => {
  query.value.identityType = val
  query.value.pageNum = 1
})

watch(verifyStatusFilter, (val) => {
  query.value.verifyStatus = val
  query.value.pageNum = 1
})

watch(statusFilter, (val) => {
  query.value.status = val
  query.value.pageNum = 1
})

function handleReset() {
  search.value = ''
  identityTypeFilter.value = undefined
  verifyStatusFilter.value = undefined
  statusFilter.value = undefined
  query.value.keyword = undefined
  query.value.identityType = undefined
  query.value.verifyStatus = undefined
  query.value.status = undefined
  query.value.pageNum = 1
}
</script>

<template>
  <BasicPage
    title="居民管理"
    description="查看小区居民;认证中可审核住房/身份申请"
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
          :identity-type-filter="identityTypeFilter"
          :verify-status-filter="verifyStatusFilter"
          :status-filter="statusFilter"
          @update:search="search = $event"
          @update:identity-type-filter="identityTypeFilter = $event"
          @update:verify-status-filter="verifyStatusFilter = $event"
          @update:status-filter="statusFilter = $event"
          @reset="handleReset"
        />
      </template>
    </DataTable>
  </BasicPage>
</template>
