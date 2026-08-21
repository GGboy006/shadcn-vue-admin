<script lang="ts" setup>
import type { IStationIncomeRankItem } from '@/services/api/workbench.api'

withDefaults(defineProps<{
  items: IStationIncomeRankItem[]
  loading?: boolean
}>(), {
  loading: false,
})

function formatAmount(amount: number) {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
</script>

<template>
  <div class="space-y-1">
    <template v-if="loading">
      <div v-for="i in 5" :key="i" class="flex items-center gap-4 py-2">
        <UiSkeleton class="size-8 shrink-0 rounded-full" />
        <UiSkeleton class="h-4 flex-1" />
        <UiSkeleton class="h-4 w-20" />
      </div>
    </template>

    <UiEmpty v-else-if="items.length === 0" class="py-8">
      <UiEmptyDescription>暂无商户收入数据</UiEmptyDescription>
    </UiEmpty>

    <div
      v-for="(item, index) in items"
      v-else :key="item.merchantCode"
      class="flex items-center gap-4 py-2"
    >
      <div
        class="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
        :class="index < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'"
      >
        {{ index + 1 }}
      </div>
      <div class="flex-1 space-y-0.5">
        <p class="text-sm font-medium leading-none">
          {{ item.merchantName }}
        </p>
        <p class="text-xs text-muted-foreground">
          {{ item.orderCount }} 笔订单
        </p>
      </div>
      <div class="font-medium">
        {{ formatAmount(item.totalAmount) }}
      </div>
    </div>
  </div>
</template>
