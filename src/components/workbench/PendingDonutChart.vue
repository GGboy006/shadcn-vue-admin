<script lang="ts" setup>
import { Donut } from '@unovis/ts'
import { VisDonut, VisSingleContainer, VisTooltip } from '@unovis/vue'

import type { ChartConfig } from '@/components/ui/chart'

import { ChartContainer, ChartLegendContent } from '@/components/ui/chart'

export interface DonutSlice {
  /** 图例/配色 key,建议使用英文 */
  key: string
  /** 展示文案 */
  label: string
  /** 数值 */
  value: number
  /** CSS 颜色,建议使用 `var(--chart-N)` */
  color: string
}

const props = withDefaults(defineProps<{
  items: DonutSlice[]
  loading?: boolean
  /** 中心大数字下方的小字说明,默认"合计" */
  subLabel?: string
}>(), {
  loading: false,
  subLabel: '合计',
})

const chartConfig = computed<ChartConfig>(() => Object.fromEntries(
  props.items.map(item => [item.key, { label: item.label, color: item.color }]),
))

const total = computed(() => props.items.reduce((sum, item) => sum + item.value, 0))

/**
 * 环形图每个分段绑定的是 d3.pie() 包装后的 arc 数据(`{ data: DonutSlice, value, ... }`),
 * 这里直接取 `.data` 拿到原始分类,渲染一个和 ChartTooltipContent 视觉一致的小卡片。
 * 没有直接复用 ChartTooltipContent,因为它是按"一个数据点多个系列"的形状设计的
 * (取 `Object.entries(payload)` 逐个匹配 config key),和环形图"一个分段一个分类"的数据形状对不上。
 */
function renderTooltip(arc: { data: DonutSlice }) {
  const slice = arc.data
  return `
    <div class="flex items-center gap-2 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      <span class="size-2.5 shrink-0 rounded-[2px]" style="background-color:${slice.color}"></span>
      <span class="text-muted-foreground">${slice.label}</span>
      <span class="font-mono font-medium text-foreground">${slice.value.toLocaleString('zh-CN')}</span>
    </div>
  `
}

const tooltipTriggers = {
  [Donut.selectors.segment]: renderTooltip,
}
</script>

<template>
  <UiSkeleton v-if="loading" class="mx-auto aspect-square h-[220px] rounded-full" />
  <UiEmpty v-else-if="total === 0" class="py-8">
    <UiEmptyDescription>暂无数据</UiEmptyDescription>
  </UiEmpty>
  <template v-else>
    <ChartContainer :config="chartConfig" class="mx-auto aspect-square max-h-[220px]">
      <VisSingleContainer :data="items">
        <VisDonut
          :value="(d: DonutSlice) => d.value"
          :color="(d: DonutSlice) => d.color"
          :arc-width="28"
          :corner-radius="4"
          :central-label="String(total)"
          :central-sub-label="subLabel"
        />
        <VisTooltip :triggers="tooltipTriggers" />
      </VisSingleContainer>
      <ChartLegendContent class="flex-wrap" />
    </ChartContainer>
  </template>
</template>
