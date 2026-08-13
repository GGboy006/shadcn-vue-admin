<route lang="yaml">
meta:
  roles: [3]
</route>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

import type { IHousekeeperCategoryListQuery, IHousekeeperServiceListQuery, IHousekeeperStaffListQuery } from '@/services/api/housekeeper.api'

import { BasicPage } from '@/components/global-layout'
import { useGetHousekeeperCategoryPageQuery, useGetHousekeeperServicePageQuery, useGetHousekeeperStaffPageQuery } from '@/services/api/housekeeper.api'

import CategoryCreate from './components/category/category-create.vue'
import { columns as categoryColumns } from './components/category/columns'
import CategoryToolbar from './components/category/data-table-toolbar.vue'
import CategoryDataTable from './components/category/data-table.vue'
import { columns as serviceColumns } from './components/service/columns'
import ServiceToolbar from './components/service/data-table-toolbar.vue'
import ServiceDataTable from './components/service/data-table.vue'
import ServiceCreate from './components/service/service-create.vue'
import { columns as staffColumns } from './components/staff/columns'
import StaffToolbar from './components/staff/data-table-toolbar.vue'
import StaffDataTable from './components/staff/data-table.vue'
import StaffCreate from './components/staff/staff-create.vue'

const activeTab = ref<'category' | 'service' | 'staff'>('category')

/* ---------------- 服务分类 §4.3 ---------------- */
const categoryQuery = ref<IHousekeeperCategoryListQuery>({
  pageNum: 1,
  pageSize: 10,
})

const { data: categoryData, isLoading: isCategoryLoading } = useGetHousekeeperCategoryPageQuery(categoryQuery)

const categoryList = computed(() => categoryData.value?.data?.list ?? [])
const categoryTotal = computed(() => categoryData.value?.data?.total ?? 0)

const categoryServerPagination = computed(() => ({
  page: categoryQuery.value.pageNum,
  pageSize: categoryQuery.value.pageSize,
  total: categoryTotal.value,
  onPageChange: (page: number) => {
    categoryQuery.value.pageNum = page
  },
  onPageSizeChange: (pageSize: number) => {
    categoryQuery.value.pageSize = pageSize
    categoryQuery.value.pageNum = 1
  },
}))

const categorySearch = ref('')
const categoryStatusFilter = ref<IHousekeeperCategoryListQuery['status']>(undefined)

const debouncedCategorySearch = useDebounceFn((val: string) => {
  categoryQuery.value.categoryName = val || undefined
  categoryQuery.value.pageNum = 1
}, 300)

watch(categorySearch, val => debouncedCategorySearch(val))

watch(categoryStatusFilter, (val) => {
  categoryQuery.value.status = val
  categoryQuery.value.pageNum = 1
})

function handleCategoryReset() {
  categorySearch.value = ''
  categoryStatusFilter.value = undefined
  categoryQuery.value.categoryName = undefined
  categoryQuery.value.status = undefined
  categoryQuery.value.pageNum = 1
}

/* ---------------- 服务主体 §4.1 ---------------- */
const serviceQuery = ref<IHousekeeperServiceListQuery>({
  pageNum: 1,
  pageSize: 10,
})

const { data: serviceData, isLoading: isServiceLoading } = useGetHousekeeperServicePageQuery(serviceQuery)

const serviceList = computed(() => serviceData.value?.data?.list ?? [])
const serviceTotal = computed(() => serviceData.value?.data?.total ?? 0)

const serviceServerPagination = computed(() => ({
  page: serviceQuery.value.pageNum,
  pageSize: serviceQuery.value.pageSize,
  total: serviceTotal.value,
  onPageChange: (page: number) => {
    serviceQuery.value.pageNum = page
  },
  onPageSizeChange: (pageSize: number) => {
    serviceQuery.value.pageSize = pageSize
    serviceQuery.value.pageNum = 1
  },
}))

const serviceSearch = ref('')
const serviceStatusFilter = ref<IHousekeeperServiceListQuery['status']>(undefined)

const debouncedServiceSearch = useDebounceFn((val: string) => {
  serviceQuery.value.name = val || undefined
  serviceQuery.value.pageNum = 1
}, 300)

watch(serviceSearch, val => debouncedServiceSearch(val))

watch(serviceStatusFilter, (val) => {
  serviceQuery.value.status = val
  serviceQuery.value.pageNum = 1
})

function handleServiceReset() {
  serviceSearch.value = ''
  serviceStatusFilter.value = undefined
  serviceQuery.value.name = undefined
  serviceQuery.value.status = undefined
  serviceQuery.value.pageNum = 1
}

/* ---------------- 服务人员 §4.2 ---------------- */
const staffQuery = ref<IHousekeeperStaffListQuery>({
  pageNum: 1,
  pageSize: 10,
})

const { data: staffData, isLoading: isStaffLoading } = useGetHousekeeperStaffPageQuery(staffQuery)

const staffList = computed(() => staffData.value?.data?.list ?? [])
const staffTotal = computed(() => staffData.value?.data?.total ?? 0)

const staffServerPagination = computed(() => ({
  page: staffQuery.value.pageNum,
  pageSize: staffQuery.value.pageSize,
  total: staffTotal.value,
  onPageChange: (page: number) => {
    staffQuery.value.pageNum = page
  },
  onPageSizeChange: (pageSize: number) => {
    staffQuery.value.pageSize = pageSize
    staffQuery.value.pageNum = 1
  },
}))

const staffSearch = ref('')
const staffHousekeeperIdFilter = ref<IHousekeeperStaffListQuery['housekeeperId']>(undefined)
const staffStatusFilter = ref<IHousekeeperStaffListQuery['status']>(undefined)

const debouncedStaffSearch = useDebounceFn((val: string) => {
  staffQuery.value.staffName = val || undefined
  staffQuery.value.pageNum = 1
}, 300)

watch(staffSearch, val => debouncedStaffSearch(val))

watch(staffHousekeeperIdFilter, (val) => {
  staffQuery.value.housekeeperId = val
  staffQuery.value.pageNum = 1
})

watch(staffStatusFilter, (val) => {
  staffQuery.value.status = val
  staffQuery.value.pageNum = 1
})

function handleStaffReset() {
  staffSearch.value = ''
  staffHousekeeperIdFilter.value = undefined
  staffStatusFilter.value = undefined
  staffQuery.value.staffName = undefined
  staffQuery.value.housekeeperId = undefined
  staffQuery.value.status = undefined
  staffQuery.value.pageNum = 1
}
</script>

<template>
  <BasicPage
    title="管家服务"
    description="管理服务分类、服务主体与服务人员"
    sticky
  >
    <template #actions>
      <CategoryCreate v-if="activeTab === 'category'" />
      <ServiceCreate v-else-if="activeTab === 'service'" />
      <StaffCreate v-else-if="activeTab === 'staff'" />
    </template>

    <UiTabs v-model="activeTab" default-value="category">
      <UiTabsList>
        <UiTabsTrigger value="category">
          服务分类
        </UiTabsTrigger>
        <UiTabsTrigger value="service">
          服务主体
        </UiTabsTrigger>
        <UiTabsTrigger value="staff">
          服务人员
        </UiTabsTrigger>
      </UiTabsList>

      <!-- 服务分类 §4.3 -->
      <UiTabsContent value="category" class="mt-4">
        <CategoryDataTable
          :loading="isCategoryLoading"
          :data="categoryList"
          :columns="categoryColumns"
          :server-pagination="categoryServerPagination"
        >
          <template #toolbar="{ table }">
            <CategoryToolbar
              :table="table"
              :search="categorySearch"
              :status-filter="categoryStatusFilter"
              @update:search="categorySearch = $event"
              @update:status-filter="categoryStatusFilter = $event"
              @reset="handleCategoryReset"
            />
          </template>
        </CategoryDataTable>
      </UiTabsContent>

      <!-- 服务主体 §4.1 -->
      <UiTabsContent value="service" class="mt-4">
        <ServiceDataTable
          :loading="isServiceLoading"
          :data="serviceList"
          :columns="serviceColumns"
          :server-pagination="serviceServerPagination"
        >
          <template #toolbar="{ table }">
            <ServiceToolbar
              :table="table"
              :search="serviceSearch"
              :status-filter="serviceStatusFilter"
              @update:search="serviceSearch = $event"
              @update:status-filter="serviceStatusFilter = $event"
              @reset="handleServiceReset"
            />
          </template>
        </ServiceDataTable>
      </UiTabsContent>

      <!-- 服务人员 §4.2 -->
      <UiTabsContent value="staff" class="mt-4">
        <StaffDataTable
          :loading="isStaffLoading"
          :data="staffList"
          :columns="staffColumns"
          :server-pagination="staffServerPagination"
        >
          <template #toolbar="{ table }">
            <StaffToolbar
              :table="table"
              :search="staffSearch"
              :housekeeper-id-filter="staffHousekeeperIdFilter"
              :status-filter="staffStatusFilter"
              @update:search="staffSearch = $event"
              @update:housekeeper-id-filter="staffHousekeeperIdFilter = $event"
              @update:status-filter="staffStatusFilter = $event"
              @reset="handleStaffReset"
            />
          </template>
        </StaffDataTable>
      </UiTabsContent>
    </UiTabs>
  </BasicPage>
</template>
