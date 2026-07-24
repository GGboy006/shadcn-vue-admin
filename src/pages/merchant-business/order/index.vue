<route lang="yaml">
meta:
  roles: [3, 4, 5]
</route>

<script setup lang="ts">
import { DownloadIcon } from '@lucide/vue'
import { useDebounceFn } from '@vueuse/core'
import { toast } from 'vue-sonner'

import type { IOrderPageQuery, OrderStatusType } from '@/services/api/merchant-business.api'

import { BasicPage } from '@/components/global-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCurrentMerchantId } from '@/composables/use-current-merchant-id'
import { useGetOrderPageQuery } from '@/services/api/merchant-business.api'
import { buildExportFilename, downloadFile } from '@/utils/download'

import { columns } from './components/columns'
import DataTable from './components/data-table.vue'
import { orderStatusTabs } from './data/status'

const { merchantId } = useCurrentMerchantId()

const query = ref<IOrderPageQuery>({
  pageNum: 1,
  pageSize: 10,
})

// Tab 用 string 管理(undefined 全部 -> 'all')
const activeTab = ref<string>('all')
watch(activeTab, (val) => {
  query.value.statusType = (val && val !== 'all' ? Number(val) : undefined) as OrderStatusType | undefined
  query.value.pageNum = 1
})

const { data, isLoading } = useGetOrderPageQuery(merchantId, query)

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

const exporting = ref(false)
async function handleExport() {
  if (!merchantId.value)
    return
  exporting.value = true
  try {
    const filename = buildExportFilename('订单导出', 'xlsx')
    await downloadFile(`/merchant/order/${merchantId.value}/export`, filename, {
      statusType: query.value.statusType,
      keyword: query.value.keyword,
    })
    toast.success('导出成功')
  }
  catch (err: any) {
    toast.error(err.message || '导出失败')
  }
  finally {
    exporting.value = false
  }
}
</script>

<template>
  <BasicPage title="订单管理" description="查看商户订单">
    <div v-if="!merchantId" class="flex items-center justify-center py-20 text-muted-foreground">
      当前无可操作的商户,请从商户列表进入。
    </div>

    <template v-else>
      <div class="flex items-center justify-between mb-4">
        <UiTabs v-model="activeTab">
          <UiTabsList>
            <UiTabsTrigger
              v-for="tab in orderStatusTabs"
              :key="tab.label"
              :value="tab.value === undefined ? 'all' : String(tab.value)"
            >
              {{ tab.label }}
            </UiTabsTrigger>
          </UiTabsList>
        </UiTabs>

        <div class="flex items-center gap-2">
          <Input v-model="search" placeholder="按订单号/客户筛选..." class="h-9 w-[200px] lg:w-[260px]" />
          <Button variant="outline" :disabled="exporting" @click="handleExport">
            <DownloadIcon class="size-4" />
            {{ exporting ? '导出中...' : '导出' }}
          </Button>
        </div>
      </div>

      <DataTable :columns :data="list" :loading="isLoading" :server-pagination="serverPagination" />
    </template>
  </BasicPage>
</template>
