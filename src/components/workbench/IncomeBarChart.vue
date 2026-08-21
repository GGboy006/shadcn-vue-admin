<script lang="ts" setup>
import { GroupedBar, Orientation } from '@unovis/ts'
import { VisAxis, VisGroupedBar, VisTooltip, VisXYContainer } from '@unovis/vue'

import type { ChartConfig } from '@/components/ui/chart'
import type { IStationIncomeRankItem } from '@/services/api/workbench.api'

import { ChartContainer, ChartTooltipContent, componentToString } from '@/components/ui/chart'

/** 商户收入排行横向柱状图,配合 `IncomeRankingList` 使用,提供可视化对比。 */
const props = withDefaults(defineProps<{
  items: IStationIncomeRankItem[]
  loading?: boolean
}>(), {
  loading: false,
})

interface Row {
  /** GroupedBar 的类目轴(config.x)在这套 unovis 版本里必须是数值,用序号代替商户名,
   * 再靠 VisAxis 的 tick-format 把序号映射回商户名展示。 */
  index: number
  name: string
  amount: number
}

const rows = computed<Row[]>(() => [...props.items]
  .sort((a, b) => b.totalAmount - a.totalAmount)
  .map((item, index) => ({ index, name: item.merchantName, amount: item.totalAmount })))

const chartConfig = {
  amount: {
    label: '订单金额',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

function formatAmount(value: number) {
  return `¥${value.toLocaleString('zh-CN')}`
}

/**
 * 横向柱状图不能用 ChartCrosshair(它写死按物理 x 轴做鼠标横扫,横向图物理 x 轴是数值轴,
 * 语义对不上),改用 VisTooltip 的 `triggers`:直接监听每根 `<path class="...bar">`
 * 的 hover,拿到绑定的 Row 数据渲染 tooltip,不依赖坐标轴方向。
 */
const renderTooltip = componentToString(chartConfig, ChartTooltipContent, {
  labelFormatter: (i: number | Date) => rows.value[i as number]?.name ?? '',
})

const tooltipTriggers = {
  [GroupedBar.selectors.bar]: renderTooltip,
}
</script>

<template>
  <UiSkeleton v-if="loading" class="h-[240px] w-full" />
  <UiEmpty v-else-if="rows.length === 0" class="py-8">
    <UiEmptyDescription>暂无商户收入数据</UiEmptyDescription>
  </UiEmpty>
  <ChartContainer v-else :config="chartConfig" class="h-[240px] w-full">
    <VisXYContainer :data="rows" :margin="{ left: 96, right: 12 }">
      <VisGroupedBar
        :x="(d: Row) => d.index"
        :y="(d: Row) => d.amount"
        :orientation="Orientation.Horizontal"
        :color="chartConfig.amount.color"
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
