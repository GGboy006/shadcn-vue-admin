<route lang="yaml">
meta:
  roles: [3]
</route>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

import type { IKnowledgeCategoryListQuery, IKnowledgeQuestionListQuery } from '@/services/api/knowledge.api'

import { BasicPage } from '@/components/global-layout'
import { useGetKnowledgeCategoryPageQuery, useGetKnowledgeQuestionPageQuery } from '@/services/api/knowledge.api'

import CategoryCreate from './components/category/category-create.vue'
import { columns as categoryColumns } from './components/category/columns'
import CategoryToolbar from './components/category/data-table-toolbar.vue'
import CategoryDataTable from './components/category/data-table.vue'
import { columns as questionColumns } from './components/question/columns'
import QuestionToolbar from './components/question/data-table-toolbar.vue'
import QuestionDataTable from './components/question/data-table.vue'
import QuestionCreate from './components/question/question-create.vue'

const router = useRouter()

const activeTab = ref<'category' | 'question'>('category')

/* ---------------- 知识分类 ---------------- */
const categoryQuery = ref<IKnowledgeCategoryListQuery>({
  pageNum: 1,
  pageSize: 10,
})

const { data: categoryData, isLoading: isCategoryLoading } = useGetKnowledgeCategoryPageQuery(categoryQuery)

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
const categoryTypeFilter = ref<IKnowledgeCategoryListQuery['categoryType']>(undefined)
const statusFilter = ref<IKnowledgeCategoryListQuery['status']>(undefined)

const debouncedCategorySearch = useDebounceFn((val: string) => {
  categoryQuery.value.categoryName = val || undefined
  categoryQuery.value.pageNum = 1
}, 300)

watch(categorySearch, val => debouncedCategorySearch(val))

watch(categoryTypeFilter, (val) => {
  categoryQuery.value.categoryType = val
  categoryQuery.value.pageNum = 1
})

watch(statusFilter, (val) => {
  categoryQuery.value.status = val
  categoryQuery.value.pageNum = 1
})

function handleCategoryReset() {
  categorySearch.value = ''
  categoryTypeFilter.value = undefined
  statusFilter.value = undefined
  categoryQuery.value.categoryName = undefined
  categoryQuery.value.categoryType = undefined
  categoryQuery.value.status = undefined
  categoryQuery.value.pageNum = 1
}

/* ---------------- 快捷问答 ---------------- */
const questionQuery = ref<IKnowledgeQuestionListQuery>({
  pageNum: 1,
  pageSize: 10,
})

const { data: questionData, isLoading: isQuestionLoading } = useGetKnowledgeQuestionPageQuery(questionQuery)

const questionList = computed(() => questionData.value?.data?.list ?? [])
const questionTotal = computed(() => questionData.value?.data?.total ?? 0)

const questionServerPagination = computed(() => ({
  page: questionQuery.value.pageNum,
  pageSize: questionQuery.value.pageSize,
  total: questionTotal.value,
  onPageChange: (page: number) => {
    questionQuery.value.pageNum = page
  },
  onPageSizeChange: (pageSize: number) => {
    questionQuery.value.pageSize = pageSize
    questionQuery.value.pageNum = 1
  },
}))

const questionSearch = ref('')

const debouncedQuestionSearch = useDebounceFn((val: string) => {
  questionQuery.value.keyword = val || undefined
  questionQuery.value.pageNum = 1
}, 300)

watch(questionSearch, val => debouncedQuestionSearch(val))

function handleQuestionReset() {
  questionSearch.value = ''
  questionQuery.value.keyword = undefined
  questionQuery.value.pageNum = 1
}
</script>

<template>
  <BasicPage
    title="知识服务"
    description="管理知识分类、文章与快捷问答"
    sticky
  >
    <template #actions>
      <UiButton variant="ghost" size="sm" @click="router.push('/community/knowledge/articles')">
        全部文章
      </UiButton>
      <CategoryCreate v-if="activeTab === 'category'" />
      <QuestionCreate v-if="activeTab === 'question'" />
    </template>

    <UiTabs v-model="activeTab" default-value="category">
      <UiTabsList>
        <UiTabsTrigger value="category">
          知识分类
        </UiTabsTrigger>
        <UiTabsTrigger value="question">
          快捷问答
        </UiTabsTrigger>
      </UiTabsList>

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
              :category-type-filter="categoryTypeFilter"
              :status-filter="statusFilter"
              @update:search="categorySearch = $event"
              @update:category-type-filter="categoryTypeFilter = $event"
              @update:status-filter="statusFilter = $event"
              @reset="handleCategoryReset"
            />
          </template>
        </CategoryDataTable>
      </UiTabsContent>

      <UiTabsContent value="question" class="mt-4">
        <QuestionDataTable
          :loading="isQuestionLoading"
          :data="questionList"
          :columns="questionColumns"
          :server-pagination="questionServerPagination"
        >
          <template #toolbar="{ table }">
            <QuestionToolbar
              :table="table"
              :search="questionSearch"
              @update:search="questionSearch = $event"
              @reset="handleQuestionReset"
            />
          </template>
        </QuestionDataTable>
      </UiTabsContent>
    </UiTabs>
  </BasicPage>
</template>
