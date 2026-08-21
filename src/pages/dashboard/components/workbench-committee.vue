<script lang="ts" setup>
import type { IStationWorkbenchVO } from '@/services/api/workbench.api'

import KpiCard from '@/components/workbench/KpiCard.vue'
import OrgPendingBarChart from '@/components/workbench/OrgPendingBarChart.vue'
import OrgRankingList from '@/components/workbench/OrgRankingList.vue'

const props = defineProps<{
  workbench?: IStationWorkbenchVO
  loading?: boolean
}>()

/**
 * 站长对居委会的管理是"签约关系 + 留言处理"维度,不是居委会自己的公告/活动运营
 * (那些数据在居委会自己的工作台 orgSummary 里,不归站长汇总接口)。
 * 所以这里只展示签约居委会数/金额、留言待处理,以及按居委会拆分的排行。
 */
const orgSignItem = computed(() => props.workbench?.signAnalysis.find(item => item.type === 'org'))
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-3">
    <KpiCard
      title="签约居委会数"
      :value="orgSignItem?.count ?? 0"
      description="社区服务覆盖数"
      :loading="loading"
    >
      <template #icon>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="size-4 text-muted-foreground">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </template>
    </KpiCard>
    <KpiCard
      title="居委会签约金额"
      :value="`¥${(orgSignItem?.amount ?? 0).toLocaleString('zh-CN')}`"
      description="居委会签约费合计"
      :loading="loading"
    >
      <template #icon>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="size-4 text-muted-foreground">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </template>
    </KpiCard>
    <KpiCard
      title="留言待处理合计"
      :value="workbench?.leaveMessagePendingCount ?? 0"
      description="名下居委会留言待处理数"
      :loading="loading"
    >
      <template #icon>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="size-4 text-muted-foreground">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </template>
    </KpiCard>
  </div>

  <UiCard>
    <UiCardHeader>
      <UiCardTitle>居委会留言待处理排行</UiCardTitle>
      <UiCardDescription>按名下居委会拆分,数据来自 City Data 汇总接口(需后端补充按居委会拆分明细)</UiCardDescription>
    </UiCardHeader>
    <UiCardContent class="space-y-6">
      <OrgPendingBarChart :items="workbench?.orgAnalysis ?? []" :loading="loading" />
      <UiSeparator />
      <OrgRankingList :items="workbench?.orgAnalysis ?? []" :loading="loading" />
    </UiCardContent>
  </UiCard>
</template>
