<script lang="ts" setup>
import type { DonutSlice } from '@/components/workbench/PendingDonutChart.vue'
import type { IStationWorkbenchVO } from '@/services/api/workbench.api'

import KpiCard from '@/components/workbench/KpiCard.vue'
import PendingDonutChart from '@/components/workbench/PendingDonutChart.vue'
import PendingList from '@/components/workbench/PendingList.vue'

const props = defineProps<{
  workbench?: IStationWorkbenchVO
  loading?: boolean
}>()

/**
 * 这个 Tab 只放侧边栏「小区服务」分组真正覆盖、且站长能处理的内容。
 * 小区动态没有审核流程,闲置物品暂无管理页,都不在看板展示。
 * 居民端 AI 使用(对应侧边栏"居民AI工具")归到这里;商户端 AI 放在「商户」Tab。
 */
const communityPending = computed(() => [
  { label: '小区服务待启用', count: props.workbench?.servicePendingCount ?? 0, to: '/community/service' },
  { label: '社区商品待启用', count: props.workbench?.communityGoodsPendingCount ?? 0, to: '/community/service' },
  { label: '意见反馈待处理', count: props.workbench?.feedbackPendingCount ?? 0, to: '/community/feedback' },
])

const pendingSlices = computed<DonutSlice[]>(() => [
  { key: 'service', label: '小区服务待启用', value: props.workbench?.servicePendingCount ?? 0, color: 'var(--chart-1)' },
  { key: 'communityGoods', label: '社区商品待启用', value: props.workbench?.communityGoodsPendingCount ?? 0, color: 'var(--chart-2)' },
  { key: 'feedback', label: '意见反馈待处理', value: props.workbench?.feedbackPendingCount ?? 0, color: 'var(--chart-3)' },
])
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <KpiCard title="小区公告总数" :value="workbench?.noticeCount ?? 0" :loading="loading" />
    <KpiCard title="小区服务待启用" :value="workbench?.servicePendingCount ?? 0" :loading="loading" />
    <KpiCard title="社区商品待启用" :value="workbench?.communityGoodsPendingCount ?? 0" :loading="loading" />
    <KpiCard title="意见反馈待处理" :value="workbench?.feedbackPendingCount ?? 0" :loading="loading" />
  </div>

  <UiCard>
    <UiCardHeader>
      <UiCardTitle>AI 服务使用概况</UiCardTitle>
      <UiCardDescription>近 30 天,居民AI工具的对话与生图使用量</UiCardDescription>
    </UiCardHeader>
    <UiCardContent class="flex items-center gap-8">
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted-foreground">AI 对话次数</span>
        <UiSkeleton v-if="loading" class="h-7 w-12" />
        <span v-else class="text-xl font-bold">{{ workbench?.residentAiConversationCount ?? 0 }}</span>
      </div>
      <UiSeparator orientation="vertical" class="h-8" />
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted-foreground">AI 生图次数</span>
        <UiSkeleton v-if="loading" class="h-7 w-12" />
        <span v-else class="text-xl font-bold">{{ workbench?.residentAiImageGenerationCount ?? 0 }}</span>
      </div>
    </UiCardContent>
  </UiCard>

  <div class="grid grid-cols-1 gap-4 lg:grid-cols-7">
    <UiCard class="col-span-1 lg:col-span-4">
      <UiCardHeader>
        <UiCardTitle>小区服务待处理分布</UiCardTitle>
        <UiCardDescription>服务/商品/反馈的待启用与待处理占比</UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <PendingDonutChart :items="pendingSlices" :loading="loading" />
      </UiCardContent>
    </UiCard>
    <UiCard class="col-span-1 lg:col-span-3">
      <UiCardHeader>
        <UiCardTitle>小区服务待处理明细</UiCardTitle>
        <UiCardDescription>点击可跳转到对应管理页面</UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <PendingList :items="communityPending" :loading="loading" />
      </UiCardContent>
    </UiCard>
  </div>
</template>
