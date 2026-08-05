<route lang="yaml">
meta:
  roles: [6]
</route>

<script setup lang="ts">
import { ArrowLeftIcon } from '@lucide/vue'
import { useDebounceFn } from '@vueuse/core'

import type { INeighborhoodSpecialArticleListQuery } from '@/services/api/neighborhood-special-article.api'

import { BasicPage } from '@/components/global-layout'
import { Button } from '@/components/ui/button'
import { useGetSpecialArticlePageQuery } from '@/services/api/neighborhood-special-article.api'

import { createColumns } from '../../special-article/components/columns'
import DataTableToolbar from '../../special-article/components/data-table-toolbar.vue'
import DataTable from '../../special-article/components/data-table.vue'
import SpecialArticleCreate from '../../special-article/components/special-article-create.vue'

const route = useRoute()
const router = useRouter()

// 从路由参数取专题标识(该路由匹配 [specialCode],必为 string)
const specialCode = computed(() => (route.params as { specialCode: string }).specialCode)

const query = ref<INeighborhoodSpecialArticleListQuery>({
  pageNum: 1,
  pageSize: 10,
  specialCode: specialCode.value,
})

const { data, isLoading } = useGetSpecialArticlePageQuery(query)

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
  query.value.pageNum = 1
}

function handleBack() {
  router.push('/neighborhood/special')
}

// 列定义需要 specialCode(传给 row-actions)
const columns = computed(() => createColumns(specialCode.value))
</script>

<template>
  <BasicPage
    title="专题文章"
    description="管理该专题下的文章"
    sticky
  >
    <template #actions>
      <Button variant="outline" @click="handleBack">
        <ArrowLeftIcon />
        返回专题列表
      </Button>
      <SpecialArticleCreate :special-code="specialCode" />
    </template>
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
            :search="search"
            @update:search="search = $event"
            @reset="handleReset"
          />
        </template>
      </DataTable>
    </div>
  </BasicPage>
</template>
