<route lang="yaml">
meta:
  roles: [3]
</route>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

import type { IResidentAiToolCateListQuery, IResidentAiToolListQuery } from '@/services/api/resident-ai-tool.api'

import { BasicPage } from '@/components/global-layout'
import {
  useGetResidentAiToolCateListQuery,
  useGetResidentAiToolCatePageQuery,
  useGetResidentAiToolListQuery,
} from '@/services/api/resident-ai-tool.api'

import CateCreate from './components/cate-create.vue'
import { columns } from './components/columns'
import DataTableToolbar from './components/data-table-toolbar.vue'
import DataTable from './components/data-table.vue'
import { toolColumns } from './components/tool-columns'
import ToolDataTableToolbar from './components/tool-data-table-toolbar.vue'
import ToolDataTable from './components/tool-data-table.vue'

const activeTab = ref('cate')

/* ==================== 分类管理(§3.1 分页) ==================== */
const query = ref<IResidentAiToolCateListQuery>({
  pageNum: 1,
  pageSize: 10,
})

const { data, isLoading } = useGetResidentAiToolCatePageQuery(query)

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

/* ==================== 已配置工具(§4.1 不分页) ==================== */
// 分类下拉数据源;同时给 cateName 兜底用
const { data: cateAllData } = useGetResidentAiToolCateListQuery()
const cateOptions = computed(() => cateAllData.value?.data ?? [])

const toolSearch = ref('')
const toolCateFilter = ref<string | undefined>(undefined)

const toolQuery = ref<IResidentAiToolListQuery>({})

const debouncedUpdateToolSearch = useDebounceFn((val: string) => {
  toolQuery.value = { ...toolQuery.value, keyword: val || undefined }
}, 300)

watch(toolSearch, val => debouncedUpdateToolSearch(val))
watch(toolCateFilter, (val) => {
  toolQuery.value = { ...toolQuery.value, cateCode: val }
})

const { data: toolData, isLoading: isToolLoading } = useGetResidentAiToolListQuery(toolQuery)
const toolList = computed(() => toolData.value?.data ?? [])

function handleToolReset() {
  toolSearch.value = ''
  toolCateFilter.value = undefined
  toolQuery.value = {}
}
</script>

<template>
  <BasicPage
    title="居民AI工具"
    description="管理AI工具分类,并按分类为全小区居民配置可用的AI工具"
    sticky
  >
    <template #actions>
      <CateCreate v-if="activeTab === 'cate'" />
    </template>

    <UiTabs v-model="activeTab" default-value="cate">
      <UiTabsList>
        <UiTabsTrigger value="cate">
          工具分类
        </UiTabsTrigger>
        <UiTabsTrigger value="tool">
          已配置工具
        </UiTabsTrigger>
      </UiTabsList>

      <!-- 工具分类 §3.1 -->
      <UiTabsContent value="cate" class="mt-4">
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
      </UiTabsContent>

      <!-- 已配置工具 §4.1(只读视图,增删回到分类的「配置工具」页) -->
      <UiTabsContent value="tool" class="mt-4">
        <ToolDataTable
          :loading="isToolLoading"
          :data="toolList"
          :columns="toolColumns"
        >
          <template #toolbar="{ table }">
            <ToolDataTableToolbar
              :table="table"
              :search="toolSearch"
              :cate-filter="toolCateFilter"
              :cate-options="cateOptions"
              @update:search="toolSearch = $event"
              @update:cate-filter="toolCateFilter = $event"
              @reset="handleToolReset"
            />
          </template>
        </ToolDataTable>
      </UiTabsContent>
    </UiTabs>
  </BasicPage>
</template>
