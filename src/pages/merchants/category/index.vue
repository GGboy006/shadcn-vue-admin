<route lang="yaml">
meta:
  roles: [3]
</route>

<script setup lang="ts">
import { PlusIcon } from '@lucide/vue'
import { useDebounceFn } from '@vueuse/core'

import type { IMerchantCategoryPageQuery } from '@/services/api/merchant.api'

import { BasicPage } from '@/components/global-layout'
import { FormSheet, FormSheetContent } from '@/components/prop-ui/form-sheet'
import { Input } from '@/components/ui/input'
import { useGetMerchantCategoryPageQuery } from '@/services/api/merchant.api'

import CategoryEdit from './components/category-edit.vue'
import { columns } from './components/columns'
import DataTable from './components/data-table.vue'

const query = ref<IMerchantCategoryPageQuery>({
  pageNum: 1,
  pageSize: 10,
})

const { data, isLoading } = useGetMerchantCategoryPageQuery(query)

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

const createOpen = ref(false)
</script>

<template>
  <BasicPage title="商户分类" description="管理商户/物业标签分类，用于新建商户时选择归类" sticky>
    <template #actions>
      <UiButton @click="createOpen = true">
        <PlusIcon />
        新建分类
      </UiButton>

      <FormSheet v-model:open="createOpen">
        <FormSheetContent>
          <CategoryEdit @close="createOpen = false" />
        </FormSheetContent>
      </FormSheet>
    </template>

    <DataTable :columns :data="list" :loading="isLoading" :server-pagination="serverPagination">
      <template #toolbar>
        <Input v-model="search" placeholder="按分类名称筛选..." class="h-9 w-[200px] lg:w-[280px]" />
      </template>
    </DataTable>
  </BasicPage>
</template>
