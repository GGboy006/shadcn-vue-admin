<route lang="yaml">
meta:
  roles: [3, 4, 5]
</route>

<script setup lang="ts">
import { BasicPage } from '@/components/global-layout'
import { useCurrentMerchantId } from '@/composables/use-current-merchant-id'
import { useMerchantWorkbenchQuery } from '@/services/api/workbench.api'

import WorkbenchOverview from './components/workbench-overview.vue'

const { merchantId, merchantName, proxyMode } = useCurrentMerchantId()

// City Data 约定每端最多调用 1 次汇总接口。商户/物业后台本身已经是独立子系统
// (侧边栏有完整的商品/订单/活动等菜单),这里不再用 Tab 拆分,单页展示核心数据即可。
const { data, isLoading } = useMerchantWorkbenchQuery()
const workbench = computed(() => data.value?.data)
</script>

<template>
  <BasicPage title="商户概览" description="商户后台首页">
    <div v-if="!merchantId" class="flex items-center justify-center py-20 text-muted-foreground">
      当前无可操作的商户,请从商户列表进入。
    </div>

    <template v-else>
      <!-- 欢迎卡:展示当前商户 + 身份模式 -->
      <div class="rounded-xl border bg-card p-6 mb-6 flex items-center justify-between">
        <div>
          <div class="text-sm text-muted-foreground mb-1">
            {{ proxyMode ? '当前代客操作' : '欢迎回来' }}
          </div>
          <div class="text-2xl font-semibold tracking-tight">
            {{ merchantName || '未命名商户' }}
          </div>
        </div>
        <div
          v-if="proxyMode"
          class="text-xs px-2.5 py-1 rounded-full border bg-amber-100/40 text-amber-900 dark:text-amber-200 border-amber-200"
        >
          代客模式
        </div>
      </div>

      <div class="space-y-4">
        <WorkbenchOverview :workbench="workbench" :loading="isLoading" />
      </div>
    </template>
  </BasicPage>
</template>
