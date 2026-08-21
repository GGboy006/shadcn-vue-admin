<script lang="ts" setup>
import type { IStationWorkbenchVO } from '@/services/api/workbench.api'

import KpiCard from '@/components/workbench/KpiCard.vue'
import SignCompositionChart from '@/components/workbench/SignCompositionChart.vue'
import SignTrendChart from '@/components/workbench/SignTrendChart.vue'

const props = defineProps<{
  workbench?: IStationWorkbenchVO
  loading?: boolean
}>()

/**
 * 站长更关注"签约"而不是商户订单收入(收入是商户自己的经营情况,和站长
 * 的考核关系不大),所以概览页的核心 KPI 与图表都围绕签约数量/金额展开,
 * 商户收入排行挪到「商户」Tab 里作为经营明细,不在这里重复强调。
 *
 * 右侧原来放的是"社区待办分布"环形图,但那份数据已经完整属于「小区服务」Tab,
 * 两处放一样的图是重复,现在换成「签约趋势」——和左侧的「签约构成」正好是
 * "存量构成"+"趋势变化"两个维度,都服务于"签约"这个核心主题。
 * AI 对话/生图已经按商户端/居民端拆开,分别放进了「商户」「小区服务」Tab。
 */
const signAnalysis = computed(() => props.workbench?.signAnalysis ?? [])
const totalSignCount = computed(() => signAnalysis.value.reduce((sum, item) => sum + item.count, 0))
const totalSignAmount = computed(() => signAnalysis.value.reduce((sum, item) => sum + item.amount, 0))
const merchantSignCount = computed(() => signAnalysis.value.find(item => item.type === 'merchant')?.count ?? 0)
const orgSignCount = computed(() => signAnalysis.value.find(item => item.type === 'org')?.count ?? 0)
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <KpiCard
      title="签约数量合计"
      :value="totalSignCount"
      description="商户/居委会/物业签约方总数"
      :loading="loading"
    >
      <template #icon>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="size-4 text-muted-foreground">
          <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
        </svg>
      </template>
    </KpiCard>
    <KpiCard
      title="签约金额合计"
      :value="`¥${totalSignAmount.toLocaleString('zh-CN')}`"
      description="商户/居委会/物业签约费合计"
      :loading="loading"
    >
      <template #icon>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="size-4 text-muted-foreground">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </template>
    </KpiCard>
    <KpiCard
      title="签约商户数"
      :value="merchantSignCount"
      description="不含居委会与物业"
      :loading="loading"
    >
      <template #icon>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="size-4 text-muted-foreground">
          <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
        </svg>
      </template>
    </KpiCard>
    <KpiCard
      title="签约居委会数"
      :value="orgSignCount"
      description="社区服务覆盖数"
      :loading="loading"
    >
      <template #icon>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="size-4 text-muted-foreground">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </template>
    </KpiCard>
  </div>

  <div class="grid grid-cols-1 gap-4 lg:grid-cols-7">
    <UiCard class="col-span-1 lg:col-span-4">
      <UiCardHeader>
        <UiCardTitle>签约构成</UiCardTitle>
        <UiCardDescription>按商户/居委会/物业拆分的签约数量与金额</UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <SignCompositionChart :items="signAnalysis" :loading="loading" />
      </UiCardContent>
    </UiCard>
    <UiCard class="col-span-1 lg:col-span-3">
      <UiCardHeader>
        <UiCardTitle>签约趋势</UiCardTitle>
        <UiCardDescription>近 6 个月新签约数量,按商户/居委会/物业拆分</UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <SignTrendChart :items="workbench?.signTrend ?? []" :loading="loading" />
      </UiCardContent>
    </UiCard>
  </div>
</template>
