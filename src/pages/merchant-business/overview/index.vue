<route lang="yaml">
meta:
  roles: [3, 4, 5]
</route>

<script setup lang="ts">
import { BasicPage } from '@/components/global-layout'
import { useCurrentMerchantId } from '@/composables/use-current-merchant-id'

const { merchantId, merchantName, proxyMode } = useCurrentMerchantId()
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

      <!-- 概览内容占位:具体指标待规划 -->
      <div class="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed text-center">
        <div class="text-muted-foreground">
          概览内容建设中
        </div>
        <div class="text-xs text-muted-foreground/70 mt-1">
          后续将在此展示该商户的核心经营指标
        </div>
      </div>
    </template>
  </BasicPage>
</template>
