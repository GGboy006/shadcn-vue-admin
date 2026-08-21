<script lang="ts" setup>
import { CurveType } from '@unovis/ts'
import { VisArea, VisAxis, VisXYContainer } from '@unovis/vue'

import type { ChartConfig } from '@/components/ui/chart'
import type { IStationOrderTrendPoint } from '@/services/api/workbench.api'

import { ChartContainer, ChartCrosshair, ChartLegendContent, ChartTooltip, ChartTooltipContent, componentToString } from '@/components/ui/chart'

/**
 * 近 7 日订单趋势(本周 vs 上周同期)双面积图,风格参考"Traffic Overview"式的
 * 平滑双曲线叠加图。X 轴同样用序号代替星期字符串(原因见 IncomeBarChart 里的注释:
 * 这套 unovis 版本的类目轴必须是数值),再靠 tick-format 映射回星期文案。
 *
 * 两条 VisArea 各自只传单个 y 存取器(不是数组),避免被库当成"堆叠面积图"
 * (堆叠面积图两条线永远不会相交,做不出参考图里两条曲线交叉穿插的效果)。
 */
const props = withDefaults(defineProps<{
  items: IStationOrderTrendPoint[]
  loading?: boolean
}>(), {
  loading: false,
})

interface Row extends IStationOrderTrendPoint {
  index: number
}

const rows = computed<Row[]>(() => props.items.map((item, index) => ({ index, ...item })))

const chartConfig = {
  thisWeek: {
    label: '本周',
    color: 'var(--chart-1)',
  },
  lastWeek: {
    label: '上周同期',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig
</script>

<template>
  <UiSkeleton v-if="loading" class="h-[240px] w-full" />
  <UiEmpty v-else-if="rows.length === 0" class="py-8">
    <UiEmptyDescription>暂无订单趋势数据</UiEmptyDescription>
  </UiEmpty>
  <ChartContainer v-else :config="chartConfig" class="h-[240px] w-full" :cursor="false">
    <VisXYContainer :data="rows" :margin="{ left: 8, right: 8 }">
      <VisArea
        :x="(d: Row) => d.index"
        :y="(d: Row) => d.thisWeek"
        :color="chartConfig.thisWeek.color"
        :opacity="0.28"
        :line="true"
        :line-color="chartConfig.thisWeek.color"
        :line-width="2"
        :curve-type="CurveType.MonotoneX"
      />
      <VisArea
        :x="(d: Row) => d.index"
        :y="(d: Row) => d.lastWeek"
        :color="chartConfig.lastWeek.color"
        :opacity="0.28"
        :line="true"
        :line-color="chartConfig.lastWeek.color"
        :line-width="2"
        :curve-type="CurveType.MonotoneX"
      />
      <VisAxis
        type="x"
        :tick-values="rows.map(r => r.index)"
        :tick-format="(i: number) => rows[i]?.day ?? ''"
        :tick-line="false"
        :domain-line="false"
        :grid-line="false"
      />
      <VisAxis
        type="y"
        :num-ticks="4"
        :tick-line="false"
        :domain-line="false"
        :grid-line="true"
      />
      <ChartTooltip />
      <ChartCrosshair
        :template="componentToString(chartConfig, ChartTooltipContent, {
          labelFormatter: (i: number | Date) => rows[i as number]?.day ?? '',
        })"
        :color="[chartConfig.thisWeek.color, chartConfig.lastWeek.color]"
      />
    </VisXYContainer>

    <ChartLegendContent />
  </ChartContainer>
</template>
