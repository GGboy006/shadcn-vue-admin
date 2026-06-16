<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

import type { IConversationListQuery } from '@/services/api/conversation.api'

import { BasicPage } from '@/components/global-layout'
import { useGetConversationListQuery } from '@/services/api/conversation.api'

import { columns } from './components/columns'
import DataTableToolbar from './components/data-table-toolbar.vue'
import DataTable from './components/data-table.vue'

// 查询参数
const query = ref<IConversationListQuery>({
  pageNum: 1,
  pageSize: 10,
})

const { data, isLoading } = useGetConversationListQuery(query)

const list = computed(() => data.value?.data?.list ?? [])
const total = computed(() => data.value?.data?.total ?? 0)

const searchTitle = ref('')
const status = ref<string | undefined>(undefined)

// 搜索防抖（接口暂无标题搜索参数，仅重置页码）
const debouncedSearch = useDebounceFn(() => {
  query.value.pageNum = 1
}, 300)

watch(searchTitle, () => debouncedSearch())

// 状态筛选
watch(status, (val) => {
  query.value.status = val
  query.value.pageNum = 1
})

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

function handleReset() {
  searchTitle.value = ''
  status.value = undefined
  query.value = {
    pageNum: 1,
    pageSize: 10,
  }
}
</script>

<template>
  <BasicPage
    title="会话列表"
    description="查看AI生成图片的历史会话记录"
    sticky
  >
    <div class="overflow-x-auto">
      <DataTable
        :loading="isLoading"
        :data="list"
        :columns="columns"
        :server-pagination="serverPagination"
      >
        <template #toolbar="{ table }">
          <DataTableToolbar
            :table="table"
            :search="searchTitle"
            :status="status"
            @update:search="searchTitle = $event"
            @update:status="status = $event"
            @reset="handleReset"
          />
        </template>
      </DataTable>
    </div>
  </BasicPage>
</template>
