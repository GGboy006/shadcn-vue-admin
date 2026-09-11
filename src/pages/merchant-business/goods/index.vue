<route lang="yaml">
meta:
  roles: [3, 4]
</route>

<script setup lang="ts">
import { PlusIcon } from '@lucide/vue'
import { useDebounceFn } from '@vueuse/core'

import type { IGoodsPageQuery } from '@/services/api/merchant-business.api'

import { BasicPage } from '@/components/global-layout'
import { FormSheet, FormSheetContent } from '@/components/prop-ui/form-sheet'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCurrentMerchantId } from '@/composables/use-current-merchant-id'
import { useGetCateAllQuery, useGetGoodsPageQuery } from '@/services/api/merchant-business.api'

import { columns } from './components/columns'
import DataTable from './components/data-table.vue'
import GoodsEdit from './components/goods-edit.vue'

const { merchantId } = useCurrentMerchantId()

const query = ref<IGoodsPageQuery>({
  pageNum: 1,
  pageSize: 10,
})

const { data, isLoading } = useGetGoodsPageQuery(merchantId, query)
const { data: cateData } = useGetCateAllQuery(merchantId)
const cateOptions = computed(() => cateData.value?.data ?? [])

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

function handleCateChange(cateCode: string | number | boolean | Record<string, unknown> | unknown) {
  const code = String(cateCode ?? '')
  query.value.cateCode = code && code !== 'all' ? code : undefined
  query.value.pageNum = 1
}

const createOpen = ref(false)
</script>

<template>
  <BasicPage title="商品管理" description="管理商户的商品">
    <div v-if="!merchantId" class="flex items-center justify-center py-20 text-muted-foreground">
      当前无可操作的商户,请从商户列表进入。
    </div>

    <template v-else>
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <Input v-model="search" placeholder="按名称筛选..." class="h-9 w-[180px] lg:w-[240px]" />
          <Select @update:model-value="handleCateChange">
            <SelectTrigger class="h-9 w-[140px]">
              <SelectValue placeholder="全部分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                全部分类
              </SelectItem>
              <SelectItem v-for="c in cateOptions" :key="c.uniqueCode" :value="c.uniqueCode">
                {{ c.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <UiButton @click="createOpen = true">
          <PlusIcon />
          新建商品
        </UiButton>

        <FormSheet v-model:open="createOpen">
          <FormSheetContent>
            <GoodsEdit @close="createOpen = false" />
          </FormSheetContent>
        </FormSheet>
      </div>

      <DataTable :columns :data="list" :loading="isLoading" :server-pagination="serverPagination" />
    </template>
  </BasicPage>
</template>
