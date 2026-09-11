<route lang="yaml">
meta:
  roles: [3, 4]
</route>

<script setup lang="ts">
import { PlusIcon } from '@lucide/vue'

import type { ICatePageQuery } from '@/services/api/merchant-business.api'

import { BasicPage } from '@/components/global-layout'
import { FormSheet, FormSheetContent } from '@/components/prop-ui/form-sheet'
import { useCurrentMerchantId } from '@/composables/use-current-merchant-id'
import { useGetCatePageQuery } from '@/services/api/merchant-business.api'

import CategoryEdit from './components/category-edit.vue'
import { columns } from './components/columns'
import DataTable from './components/data-table.vue'

const { merchantId } = useCurrentMerchantId()

const query = ref<ICatePageQuery>({
  pageNum: 1,
  pageSize: 10,
})

const { data, isLoading } = useGetCatePageQuery(merchantId, query)

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

const createOpen = ref(false)
</script>

<template>
  <BasicPage title="商品分类" description="管理商户的商品分类">
    <div v-if="!merchantId" class="flex items-center justify-center py-20 text-muted-foreground">
      当前无可操作的商户,请从商户列表进入。
    </div>

    <template v-else>
      <div class="flex items-center justify-end mb-4">
        <UiButton @click="createOpen = true">
          <PlusIcon />
          新建分类
        </UiButton>

        <FormSheet v-model:open="createOpen">
          <FormSheetContent>
            <CategoryEdit @close="createOpen = false" />
          </FormSheetContent>
        </FormSheet>
      </div>

      <DataTable :columns :data="list" :loading="isLoading" :server-pagination="serverPagination" />
    </template>
  </BasicPage>
</template>
