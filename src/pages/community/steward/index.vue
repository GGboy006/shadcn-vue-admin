<route lang="yaml">
meta:
  roles: [3]
</route>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

import type { IHousekeeperCategoryListQuery } from '@/services/api/housekeeper.api'

import { BasicPage } from '@/components/global-layout'
import { useGetHousekeeperCategoryPageQuery } from '@/services/api/housekeeper.api'

import CategoryAssignSheet from './components/category/category-assign-sheet.vue'
import CategoryCreate from './components/category/category-create.vue'
import { columns as categoryColumns } from './components/category/columns'
import CategoryToolbar from './components/category/data-table-toolbar.vue'
import CategoryDataTable from './components/category/data-table.vue'
import OrgStaffPanel from './components/org-staff/org-staff-panel.vue'

type StewardTab = 'org' | 'category'

const route = useRoute()
const router = useRouter()

const activeTab = ref<StewardTab>('org')
const selectedOrgId = ref<string | undefined>()
const assignCategoryId = ref<string | undefined>()

const isAssignOpen = computed({
  get: () => !!assignCategoryId.value,
  set: (open) => {
    if (!open)
      assignCategoryId.value = undefined
  },
})

let syncingFromRoute = false

function readRouteQuery() {
  syncingFromRoute = true
  activeTab.value = route.query.tab === 'category' ? 'category' : 'org'
  selectedOrgId.value = typeof route.query.orgId === 'string' ? route.query.orgId : undefined
  assignCategoryId.value = typeof route.query.assign === 'string' ? route.query.assign : undefined
  if (assignCategoryId.value)
    activeTab.value = 'category'
  nextTick(() => {
    syncingFromRoute = false
  })
}

function writeRouteQuery() {
  if (syncingFromRoute)
    return
  const query: Record<string, string> = {
    tab: activeTab.value,
  }
  if (activeTab.value === 'org' && selectedOrgId.value)
    query.orgId = selectedOrgId.value
  if (assignCategoryId.value) {
    query.tab = 'category'
    query.assign = assignCategoryId.value
  }
  router.replace({ path: '/community/steward', query })
}

watch(() => route.query, readRouteQuery, { immediate: true })
watch([activeTab, selectedOrgId, assignCategoryId], writeRouteQuery)

function openCategoryAssign(categoryId: string) {
  activeTab.value = 'category'
  assignCategoryId.value = categoryId
}

function closeCategoryAssign() {
  assignCategoryId.value = undefined
}

provide('stewardAssignCategory', openCategoryAssign)

/* ---------------- 展示分类 §4.3 ---------------- */
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
</script>

<template>
  <BasicPage
    title="管家服务"
    description="先配置服务机构与人员，再在展示分类中分配居民可见的服务人员"
    sticky
  >
    <template #actions>
      <CategoryCreate v-if="activeTab === 'category'" />
    </template>

    <UiTabs v-model="activeTab" default-value="org">
      <UiTabsList>
        <UiTabsTrigger value="org">
          机构与人员
        </UiTabsTrigger>
        <UiTabsTrigger value="category">
          展示分类与分配
        </UiTabsTrigger>
      </UiTabsList>

      <UiTabsContent value="org" class="mt-4">
        <OrgStaffPanel v-model:org-id="selectedOrgId" />
      </UiTabsContent>

      <UiTabsContent value="category" class="mt-4">
        <p class="mb-3 text-sm text-muted-foreground">
          居民端看到的类目在此维护；创建分类后需「分配人员」才会展示具体服务人员。
        </p>
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
    </UiTabs>

    <CategoryAssignSheet
      v-model:open="isAssignOpen"
      :category-id="assignCategoryId"
      @close="closeCategoryAssign"
    />
  </BasicPage>
</template>
