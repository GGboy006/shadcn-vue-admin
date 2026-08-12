<route lang="yaml">
meta:
  roles: [3]
</route>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

import type { FeedbackStatus, IFeedbackListQuery } from '@/services/api/feedback.api'

import { BasicPage } from '@/components/global-layout'
import { cn } from '@/lib/utils'
import {
  useGetFeedbackPageQuery,
  useGetFeedbackStatsQuery,
} from '@/services/api/feedback.api'

import { columns } from './components/columns'
import DataTableToolbar from './components/data-table-toolbar.vue'
import DataTable from './components/data-table.vue'

/* ---------------- 统计 ---------------- */
const { data: statsData } = useGetFeedbackStatsQuery()
const stats = computed(() => statsData.value?.data)

const statCards = computed(() => [
  { key: undefined as FeedbackStatus | undefined, label: '全部', value: stats.value?.total ?? 0 },
  { key: 1 as FeedbackStatus, label: '待处理', value: stats.value?.pending ?? 0 },
  { key: 2 as FeedbackStatus, label: '已处理', value: stats.value?.processed ?? 0 },
  { key: 3 as FeedbackStatus, label: '已回复', value: stats.value?.replied ?? 0 },
])

/* ---------------- 列表 ---------------- */
const query = ref<IFeedbackListQuery>({
  pageNum: 1,
  pageSize: 10,
})

const { data, isLoading } = useGetFeedbackPageQuery(query)

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
const statusFilter = ref<IFeedbackListQuery['status']>(undefined)
const feedbackTypeFilter = ref<IFeedbackListQuery['feedbackType']>(undefined)

const debouncedUpdateSearch = useDebounceFn((val: string) => {
  query.value.keyword = val || undefined
  query.value.pageNum = 1
}, 300)

watch(search, val => debouncedUpdateSearch(val))

watch(statusFilter, (val) => {
  query.value.status = val
  query.value.pageNum = 1
})

watch(feedbackTypeFilter, (val) => {
  query.value.feedbackType = val
  query.value.pageNum = 1
})

function handleStatClick(status: FeedbackStatus | undefined) {
  statusFilter.value = status
}

function handleReset() {
  search.value = ''
  statusFilter.value = undefined
  feedbackTypeFilter.value = undefined
  query.value.keyword = undefined
  query.value.status = undefined
  query.value.feedbackType = undefined
  query.value.pageNum = 1
}
</script>

<template>
  <BasicPage
    title="意见反馈"
    description="查看居民反馈,回复与状态管理"
    sticky
  >
    <!-- 统计卡片(可点击筛选) -->
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <button
        v-for="card in statCards"
        :key="card.label"
        type="button"
        :class="cn(
          'flex flex-col rounded-lg border p-4 text-left transition-colors hover:border-primary/50',
          statusFilter === card.key
            ? 'border-primary bg-primary/5'
            : 'border-border bg-card',
        )"
        @click="handleStatClick(card.key)"
      >
        <span class="text-sm font-medium text-muted-foreground">
          {{ card.label }}
        </span>
        <span class="mt-1 text-2xl font-bold tabular-nums">
          {{ card.value }}
        </span>
      </button>
    </div>

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
          :status-filter="statusFilter"
          :feedback-type-filter="feedbackTypeFilter"
          @update:search="search = $event"
          @update:status-filter="statusFilter = $event"
          @update:feedback-type-filter="feedbackTypeFilter = $event"
          @reset="handleReset"
        />
      </template>
    </DataTable>
  </BasicPage>
</template>
