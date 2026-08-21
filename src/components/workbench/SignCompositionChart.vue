<script lang="ts" setup>
import { GroupedBar, Orientation } from '@unovis/ts'
import { VisAxis, VisGroupedBar, VisTooltip, VisXYContainer } from '@unovis/vue'

import type { ChartConfig } from '@/components/ui/chart'
import type { IStationSignItem } from '@/services/api/workbench.api'

import { ChartContainer } from '@/components/ui/chart'

/**
 * 站长概览页"签约构成"横向柱状图:按 商户/居委会/物业 三类展示签约金额,
 * 柱长直观对比金额,数量放在 tooltip 里一起展示(数量和金额量纲不同,
 * 不适合画在同一根轴上)。
 *
 * 实现上复用 `IncomeBarChart` 里验证过的写法:X 轴(类目轴)用序号代替
 * 字符串类型名,再用 tick-format 映射回展示文案,避开这套 unovis 版本里
 * `GroupedBar` 类目轴必须是数值的限制。
 */
const props = withDefaults(defineProps<{
  items: IStationSignItem[]
  loading?: boolean
}>(), {
  loading: false,
})

interface Row extends IStationSignItem {
  index: number
}

const rows = computed<Row[]>(() => props.items.map((item, index) => ({ index, ...item })))

const totalCount = computed(() => props.items.reduce((sum, item) => sum + item.count, 0))
const totalAmount = computed(() => props.items.reduce((sum, item) => sum + item.amount, 0))

const chartConfig = {
  amount: {
    label: '签约金额',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

function formatAmount(value: number) {
  return `¥${value.toLocaleString('zh-CN')}`
}

function renderTooltip(row: Row) {
  return `
    <div class="rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      <div class="mb-1 font-medium text-foreground">${row.typeName}</div>
      <div class="flex items-center justify-between gap-4 text-muted-foreground">
        <span>签约数量</span><span class="font-mono font-medium text-foreground">${row.count}</span>
      </div>
      <div class="flex items-center justify-between gap-4 text-muted-foreground">
        <span>签约金额</span><span class="font-mono font-medium text-foreground">${formatAmount(row.amount)}</span>
      </div>
    </div>
  `
}

const tooltipTriggers = {
  [GroupedBar.selectors.bar]: renderTooltip,
}
</script>

<template>
  <UiSkeleton v-if="loading" class="h-[240px] w-full" />
  <UiEmpty v-else-if="rows.length === 0" class="py-8">
    <UiEmptyDescription>暂无签约数据</UiEmptyDescription>
  </UiEmpty>
  <template v-else>
    <div class="mb-4 flex items-center gap-6 text-sm">
      <div>
        <span class="text-muted-foreground">签约数量合计</span>
        <span class="ml-1.5 font-semibold">{{ totalCount }}</span>
      </div>
      <div>
        <span class="text-muted-foreground">签约金额合计</span>
        <span class="ml-1.5 font-semibold">{{ formatAmount(totalAmount) }}</span>
      </div>
    </div>
    <ChartContainer :config="chartConfig" class="h-[190px] w-full">
      <VisXYContainer :data="rows" :margin="{ left: 64, right: 12 }">
        <VisGroupedBar
          :x="(d: Row) => d.index"
          :y="(d: Row) => d.amount"
          :orientation="Orientation.Horizontal"
          :color="chartConfig.amount.color"
          :rounded-corners="4"
          bar-padding="0.35"
        />
        <VisAxis
          type="y"
          :tick-values="rows.map(r => r.index)"
          :tick-format="(i: number) => rows[i]?.typeName ?? ''"
          :tick-line="false"
          :domain-line="false"
          :grid-line="false"
        />
        <VisAxis
          type="x"
          :tick-format="(v: number) => formatAmount(v)"
          :tick-line="false"
          :domain-line="false"
          :grid-line="true"
          :num-ticks="4"
        />
        <VisTooltip :triggers="tooltipTriggers" />
      </VisXYContainer>
    </ChartContainer>
  </template>
</template>
