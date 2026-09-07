<route lang="yaml">
meta:
  roles: [3]
</route>

<script setup lang="ts">
import { useDebounceFn, useMediaQuery } from '@vueuse/core'

import type { ICommunityServiceListQuery } from '@/services/api/community-service.api'

import { BasicPage } from '@/components/global-layout'
import { useGetServicePageQuery } from '@/services/api/community-service.api'

import { columns } from './components/columns'
import DataTableToolbar from './components/data-table-toolbar.vue'
import DataTable from './components/data-table.vue'
import ServiceCreate from './components/service-create.vue'
import ServicePhonePreview from './components/service-phone-preview.vue'

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

/** 预览单独拉较大 pageSize，避免只看到当前分页的 10 条 */
const previewQuery = ref<ICommunityServiceListQuery>({
  pageNum: 1,
  pageSize: 200,
})

const { data: previewData, isLoading: isPreviewLoading } = useGetServicePageQuery(previewQuery)
const previewServices = computed(() => previewData.value?.data?.list ?? [])

const isDesktop = useMediaQuery('(min-width: 1024px)')
const mobilePane = ref<'list' | 'preview'>('list')
</script>

<template>
  <BasicPage
    title="小区服务"
    description="管理小区服务入口(小程序/H5/阅览室/商户/AI助手/商品等)；右侧可预览启用态在小程序中的布局"
    sticky
  >
    <template #actions>
      <ServiceCreate />
    </template>

    <!-- 窄屏：列表 / 预览切换 -->
    <div class="mb-3 lg:hidden">
      <UiTabs v-model="mobilePane" default-value="list">
        <UiTabsList class="grid w-full grid-cols-2">
          <UiTabsTrigger value="list">
            列表
          </UiTabsTrigger>
          <UiTabsTrigger value="preview">
            小程序预览
          </UiTabsTrigger>
        </UiTabsList>
      </UiTabs>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
      <div :class="!isDesktop && mobilePane === 'preview' ? 'hidden' : ''">
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
      </div>

      <aside
        class="justify-self-center lg:sticky lg:top-4 lg:justify-self-end"
        :class="!isDesktop && mobilePane === 'list' ? 'hidden' : ''"
      >
        <ServicePhonePreview
          :services="previewServices"
          :loading="isPreviewLoading"
        />
      </aside>
    </div>
  </BasicPage>
</template>
