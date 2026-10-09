<route lang="yaml">
meta:
  roles: [3]
</route>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

import type { IKnowledgeArticleListQuery } from '@/services/api/knowledge.api'

import { BasicPage } from '@/components/global-layout'
import { useGetKnowledgeArticlePageQuery, useGetKnowledgeCategoryDetailQuery } from '@/services/api/knowledge.api'

import ArticleCreate from './components/article/article-create.vue'
import { columns } from './components/article/columns'
import DataTableToolbar from './components/article/data-table-toolbar.vue'
import DataTable from './components/article/data-table.vue'

const route = useRoute()
const router = useRouter()
const categoryId = computed(() => String((route.params as Record<string, string>).categoryId ?? ''))

// 拉分类详情拿名称(标题用)
const { data: categoryData } = useGetKnowledgeCategoryDetailQuery(categoryId)
const categoryName = computed(() => categoryData.value?.data?.categoryName ?? '')

const query = ref<IKnowledgeArticleListQuery>({
  pageNum: 1,
  pageSize: 10,
  categoryId: categoryId.value,
})

// categoryId 变化时同步 query
watch(categoryId, (val) => {
  if (val)
    query.value.categoryId = val
}, { immediate: true })

const { data, isLoading } = useGetKnowledgeArticlePageQuery(query)

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
const publishStatusFilter = ref<IKnowledgeArticleListQuery['publishStatus']>(undefined)
const topFlagFilter = ref<IKnowledgeArticleListQuery['topFlag']>(undefined)

const debouncedUpdateSearch = useDebounceFn((val: string) => {
  query.value.keyword = val || undefined
  query.value.pageNum = 1
}, 300)

watch(search, val => debouncedUpdateSearch(val))

watch(publishStatusFilter, (val) => {
  query.value.publishStatus = val
  query.value.pageNum = 1
})

watch(topFlagFilter, (val) => {
  query.value.topFlag = val
  query.value.pageNum = 1
})

function handleReset() {
  search.value = ''
  publishStatusFilter.value = undefined
  topFlagFilter.value = undefined
  query.value.keyword = undefined
  query.value.publishStatus = undefined
  query.value.topFlag = undefined
  query.value.pageNum = 1
}
</script>

<template>
  <BasicPage
    :title="categoryName ? `${categoryName} · 文章` : '分类文章'"
    description="该分类下的知识文章"
    sticky
  >
    <template #actions>
      <UiButton variant="ghost" size="sm" @click="router.push('/community/knowledge')">
        返回
      </UiButton>
      <ArticleCreate :lock-category-id="categoryId" />
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
          :publish-status-filter="publishStatusFilter"
          :top-flag-filter="topFlagFilter"
          :lock-category="true"
          @update:search="search = $event"
          @update:publish-status-filter="publishStatusFilter = $event"
          @update:top-flag-filter="topFlagFilter = $event"
          @reset="handleReset"
        />
      </template>
    </DataTable>
  </BasicPage>
</template>
