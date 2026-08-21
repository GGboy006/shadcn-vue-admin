<script lang="ts" setup>
import type { IStationWorkbenchVO } from '@/services/api/workbench.api'

import IncomeBarChart from '@/components/workbench/IncomeBarChart.vue'
import IncomeRankingList from '@/components/workbench/IncomeRankingList.vue'
import KpiCard from '@/components/workbench/KpiCard.vue'
import OrderTrendAreaChart from '@/components/workbench/OrderTrendAreaChart.vue'

defineProps<{
  workbench?: IStationWorkbenchVO
  loading?: boolean
}>()
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <KpiCard title="商户商品总数" :value="workbench?.merchantGoodsCount ?? 0" :loading="loading" />
    <KpiCard title="商户 FAQ 总数" :value="workbench?.merchantFaqCount ?? 0" :loading="loading" />
    <KpiCard title="商户活动总数" :value="workbench?.merchantActivityCount ?? 0" :loading="loading" />
    <KpiCard
      title="区间订单总额"
      :value="`¥${(workbench?.totalOrderAmount ?? 0).toLocaleString('zh-CN')}`"
      :loading="loading"
    />
  </div>

  <UiCard>
    <UiCardHeader>
      <UiCardTitle>AI 服务使用概况</UiCardTitle>
      <UiCardDescription>近 30 天,数字员工/AI 工具处理商户相关咨询与生图</UiCardDescription>
    </UiCardHeader>
    <UiCardContent class="flex items-center gap-8">
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted-foreground">AI 对话次数</span>
        <UiSkeleton v-if="loading" class="h-7 w-12" />
        <span v-else class="text-xl font-bold">{{ workbench?.merchantAiConversationCount ?? 0 }}</span>
      </div>
      <UiSeparator orientation="vertical" class="h-8" />
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted-foreground">AI 生图次数</span>
        <UiSkeleton v-if="loading" class="h-7 w-12" />
        <span v-else class="text-xl font-bold">{{ workbench?.merchantAiImageGenerationCount ?? 0 }}</span>
      </div>
    </UiCardContent>
  </UiCard>

  <UiCard>
    <UiCardHeader>
      <UiCardTitle>近 7 日订单趋势</UiCardTitle>
      <UiCardDescription>本周 vs 上周同期,单位:笔(后端接口待新增,当前为示例数据)</UiCardDescription>
    </UiCardHeader>
    <UiCardContent>
      <OrderTrendAreaChart :items="workbench?.orderTrend ?? []" :loading="loading" />
    </UiCardContent>
  </UiCard>

  <UiCard>
    <UiCardHeader>
      <UiCardTitle>商户收入排行</UiCardTitle>
      <UiCardDescription>按区间内订单金额排序,数据来自 City Data 汇总接口</UiCardDescription>
    </UiCardHeader>
    <UiCardContent class="space-y-6">
      <IncomeBarChart :items="workbench?.incomeAnalysis ?? []" :loading="loading" />
      <UiSeparator />
      <IncomeRankingList :items="workbench?.incomeAnalysis ?? []" :loading="loading" />
    </UiCardContent>
  </UiCard>
</template>
