<route lang="yaml">
meta:
  roles: [3]
</route>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

import type { IHousekeeperCategoryListQuery } from '@/services/api/housekeeper.api'

import { BasicPage } from '@/components/global-layout'
import { useGetHousekeeperCategoryPageQuery } from '@/services/api/housekeeper.api'

import CategoryCreate from './components/category/category-create.vue'
import { columns as categoryColumns } from './components/category/columns'
import CategoryToolbar from './components/category/data-table-toolbar.vue'
import CategoryDataTable from './components/category/data-table.vue'

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
const statusFilter = ref<IHousekeeperCategoryListQuery['status']>(undefined)

const debouncedCategorySearch = useDebounceFn((val: string) => {
  categoryQuery.value.categoryName = val || undefined
  categoryQuery.value.pageNum = 1
}, 300)

watch(categorySearch, val => debouncedCategorySearch(val))

watch(statusFilter, (val) => {
  categoryQuery.value.status = val
  categoryQuery.value.pageNum = 1
})

function handleCategoryReset() {
  categorySearch.value = ''
  statusFilter.value = undefined
  categoryQuery.value.categoryName = undefined
  categoryQuery.value.status = undefined
  categoryQuery.value.pageNum = 1
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
              :status-filter="statusFilter"
              @update:search="categorySearch = $event"
              @update:status-filter="statusFilter = $event"
              @reset="handleCategoryReset"
            />
          </template>
        </CategoryDataTable>
      </UiTabsContent>

      <!-- 服务主体 §4.1(批次 2) -->
      <UiTabsContent value="service" class="mt-4">
        <div class="py-10 text-center text-sm text-muted-foreground">
          服务主体管理开发中
        </div>
      </UiTabsContent>

      <!-- 服务人员 §4.2(批次 3) -->
      <UiTabsContent value="staff" class="mt-4">
        <div class="py-10 text-center text-sm text-muted-foreground">
          服务人员管理开发中
        </div>
      </UiTabsContent>
    </UiTabs>
  </BasicPage>
</template>
