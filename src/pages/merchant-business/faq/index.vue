<route lang="yaml">
meta:
  roles: [3, 4, 5]
</route>

<script setup lang="ts">
import { PlusIcon } from '@lucide/vue'
import { useDebounceFn } from '@vueuse/core'

import type { IFaqPageQuery } from '@/services/api/merchant-business.api'

import { BasicPage } from '@/components/global-layout'
import { Modal, ModalContent, ModalTrigger } from '@/components/prop-ui/modal'
import { Input } from '@/components/ui/input'
import { useCurrentMerchantId } from '@/composables/use-current-merchant-id'
import { useGetFaqPageQuery } from '@/services/api/merchant-business.api'

import { columns } from './components/columns'
import DataTable from './components/data-table.vue'
import FaqEdit from './components/faq-edit.vue'

const { merchantId } = useCurrentMerchantId()

const query = ref<IFaqPageQuery>({
  pageNum: 1,
  pageSize: 10,
})

const { data, isLoading } = useGetFaqPageQuery(merchantId, query)

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
  <BasicPage title="FAQ" description="管理商户常见问题">
    <div v-if="!merchantId" class="flex items-center justify-center py-20 text-muted-foreground">
      当前无可操作的商户,请从商户列表进入。
    </div>

    <template v-else>
      <div class="flex items-center justify-between mb-4">
        <Input v-model="search" placeholder="按问题/标签筛选..." class="h-9 w-[200px] lg:w-[280px]" />
        <Modal v-model:open="createOpen">
          <ModalTrigger as-child>
            <UiButton>
              <PlusIcon />
              新建FAQ
            </UiButton>
          </ModalTrigger>
          <ModalContent>
            <FaqEdit @close="createOpen = false" />
          </ModalContent>
        </Modal>
      </div>

      <DataTable :columns :data="list" :loading="isLoading" :server-pagination="serverPagination" />
    </template>
  </BasicPage>
</template>
