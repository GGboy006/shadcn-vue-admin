<script lang="ts" setup>
import type { IStationOrgItem } from '@/services/api/workbench.api'

/** 「居委会」Tab 的明细列表,配合 `OrgPendingBarChart` 使用,展示签约金额与留言待处理数。 */
withDefaults(defineProps<{
  items: IStationOrgItem[]
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
        <UiSkeleton class="h-4 w-16" />
      </div>
    </template>

    <UiEmpty v-else-if="items.length === 0" class="py-8">
      <UiEmptyDescription>暂无居委会数据</UiEmptyDescription>
    </UiEmpty>

    <div
      v-for="item in items"
      v-else :key="item.orgCode"
      class="flex items-center gap-4 py-2"
    >
      <div class="flex-1 space-y-0.5">
        <p class="text-sm font-medium leading-none">
          {{ item.orgName }}
        </p>
        <p class="text-xs text-muted-foreground">
          签约金额 {{ formatAmount(item.signAmount) }}
        </p>
      </div>
      <UiBadge :variant="item.leaveMessagePending > 0 ? 'default' : 'secondary'">
        留言待处理 {{ item.leaveMessagePending }}
      </UiBadge>
    </div>
  </div>
</template>
