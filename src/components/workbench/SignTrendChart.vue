<script lang="ts" setup>
import { VisAxis, VisGroupedBar, VisXYContainer } from '@unovis/vue'

import type { ChartConfig } from '@/components/ui/chart'
import type { IStationSignTrendPoint } from '@/services/api/workbench.api'

import { ChartContainer, ChartCrosshair, ChartLegendContent, ChartTooltip, ChartTooltipContent, componentToString } from '@/components/ui/chart'

/**
 * 「概览」Tab 右侧图表:近 6 个月新签约趋势,按商户/居委会/物业分组柱状图,
 * 和左侧「签约构成」形成互补 —— 左边是"现在存量构成",右边是"最近几个月
 * 每月新增了多少,按类型拆分"。
 *
 * X 轴同样用序号代替月份字符串(这套 unovis 版本的类目轴必须是数值,原因见
 * `IncomeBarChart` 里的注释)。三个类型用 `VisGroupedBar` 的多 y 存取器
 * 并排分组(不是堆叠,分组柱状图语义本身就是"并排对比",不需要额外处理)。
 */
const props = withDefaults(defineProps<{
  items: IStationSignTrendPoint[]
  loading?: boolean
}>(), {
  loading: false,
})

interface Row extends IStationSignTrendPoint {
  index: number
}

const rows = computed<Row[]>(() => props.items.map((item, index) => ({ index, ...item })))

const chartConfig = {
  merchant: { label: '商户', color: 'var(--chart-1)' },
  org: { label: '居委会', color: 'var(--chart-2)' },
  property: { label: '物业', color: 'var(--chart-3)' },
} satisfies ChartConfig

const seriesColors = [chartConfig.merchant.color, chartConfig.org.color, chartConfig.property.color]
</script>

<template>
  <UiSkeleton v-if="loading" class="h-[190px] w-full" />
  <UiEmpty v-else-if="rows.length === 0" class="py-8">
    <UiEmptyDescription>暂无签约趋势数据</UiEmptyDescription>
  </UiEmpty>
  <ChartContainer v-else :config="chartConfig" class="h-[190px] w-full" :cursor="false">
    <VisXYContainer :data="rows" :margin="{ left: 8, right: 8 }">
      <VisGroupedBar
        :x="(d: Row) => d.index"
        :y="[(d: Row) => d.merchant, (d: Row) => d.org, (d: Row) => d.property]"
        :color="(_d: Row, i: number) => seriesColors[i]"
        :rounded-corners="3"
        group-padding="0.25"
        bar-padding="0.08"
      />
      <VisAxis
        type="x"
        :tick-values="rows.map(r => r.index)"
        :tick-format="(i: number) => rows[i]?.month ?? ''"
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
          labelFormatter: (i: number | Date) => rows[i as number]?.month ?? '',
        })"
        :color="seriesColors"
      />
    </VisXYContainer>

    <ChartLegendContent />
  </ChartContainer>
</template>
