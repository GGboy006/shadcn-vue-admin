<script lang="ts" setup>
import { GroupedBar, Orientation } from '@unovis/ts'
import { VisAxis, VisGroupedBar, VisTooltip, VisXYContainer } from '@unovis/vue'

import type { ChartConfig } from '@/components/ui/chart'
import type { IStationOrgItem } from '@/services/api/workbench.api'

import { ChartContainer } from '@/components/ui/chart'

/**
 * 「居委会」Tab 的留言待处理排行横向柱状图,和「商户」Tab 的 `IncomeBarChart`
 * 是同一套写法(类目轴用序号代替居委会名,靠 tick-format 映射回文案),
 * 保持两个 Tab 的视觉语言一致。
 */
const props = withDefaults(defineProps<{
  items: IStationOrgItem[]
  loading?: boolean
}>(), {
  loading: false,
})

interface Row {
  index: number
  name: string
  pending: number
}

const rows = computed<Row[]>(() => [...props.items]
  .sort((a, b) => b.leaveMessagePending - a.leaveMessagePending)
  .map((item, index) => ({ index, name: item.orgName, pending: item.leaveMessagePending })))

const chartConfig = {
  pending: {
    label: '留言待处理',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig

function renderTooltip(row: Row) {
  return `
    <div class="rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      <div class="mb-1 font-medium text-foreground">${row.name}</div>
      <div class="flex items-center justify-between gap-4 text-muted-foreground">
        <span>留言待处理</span><span class="font-mono font-medium text-foreground">${row.pending}</span>
      </div>
    </div>
  `
}

const tooltipTriggers = {
  [GroupedBar.selectors.bar]: renderTooltip,
}
</script>

<template>
  <UiSkeleton v-if="loading" class="h-[200px] w-full" />
  <UiEmpty v-else-if="rows.length === 0" class="py-8">
    <UiEmptyDescription>暂无居委会数据</UiEmptyDescription>
  </UiEmpty>
  <ChartContainer v-else :config="chartConfig" class="h-[200px] w-full">
    <VisXYContainer :data="rows" :margin="{ left: 96, right: 12 }">
      <VisGroupedBar
        :x="(d: Row) => d.index"
        :y="(d: Row) => d.pending"
        :orientation="Orientation.Horizontal"
        :color="chartConfig.pending.color"
        :rounded-corners="4"
        bar-padding="0.3"
      />
      <VisAxis
        type="y"
        :tick-values="rows.map(r => r.index)"
        :tick-format="(i: number) => rows[i]?.name ?? ''"
        :tick-line="false"
        :domain-line="false"
        :grid-line="false"
      />
      <VisAxis
        type="x"
        :tick-line="false"
        :domain-line="false"
        :grid-line="true"
        :num-ticks="4"
      />
      <VisTooltip :triggers="tooltipTriggers" />
    </VisXYContainer>
  </ChartContainer>
</template>
