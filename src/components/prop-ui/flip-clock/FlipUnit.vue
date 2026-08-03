<script lang="ts" setup>
import type { VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'vue'

import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const props = defineProps<{
  digit: number | string
  size?: FlipUnitVariants['size']
  variant?: FlipUnitVariants['variant']
  class?: HTMLAttributes['class']
}>()

const flipUnitVariants = cva(
  'relative subpixel-antialiased perspective-[1000px] rounded-md overflow-hidden',
  {
    variants: {
      size: {
        mini: 'w-8 min-w-8 h-11 text-xl', // 迷你(极小侧栏/紧凑位)
        sm: 'w-10 min-w-10 h-14 text-3xl', // 小尺寸(紧凑 UI)
        md: 'w-14 min-w-14 h-20 text-5xl', // 中尺寸(标准侧栏/头部)
        lg: 'w-17 min-w-17 h-24 text-6xl', // 大尺寸(聚焦/主视觉)
        xl: 'w-22 min-w-22 h-32 text-8xl', // 超大(仪表盘/落地页)
      },
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-input bg-background text-foreground',
        muted: 'bg-muted text-muted-foreground',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  },
)

type FlipUnitVariants = VariantProps<typeof flipUnitVariants>

// 上一个数字(翻牌动画期间保留显示旧值)
const prevDigit = ref(props.digit)
// 是否正在翻牌
const flipping = ref(false)
// 当前翻牌定时器(每次翻牌更新,组件卸载时统一清理)
let flipTimer: ReturnType<typeof setTimeout> | null = null

watch(() => props.digit, (digit) => {
  if (digit === prevDigit.value)
    return
  flipping.value = true
  // 等待完整动画(上 0.3s + 下 0.3s)结束后重置
  if (flipTimer)
    clearTimeout(flipTimer)
  flipTimer = setTimeout(() => {
    flipping.value = false
    prevDigit.value = digit
    flipTimer = null
  }, 550) // 略小于 600ms 保证顺滑
})

// 组件卸载时清理未完成的定时器
onUnmounted(() => {
  if (flipTimer)
    clearTimeout(flipTimer)
})
</script>

<template>
  <div :class="cn(flipUnitVariants({ size: props.size, variant: props.variant }), props.class)">
    <!-- 1. 背景上半(新数字,等待显示) -->
    <div class="absolute inset-x-0 h-1/2 overflow-hidden rounded-t-lg bg-inherit text-inherit top-0">
      <span class="absolute left-0 right-0 flex w-full h-[200%] items-center justify-center" style="top: 0%;">
        {{ props.digit }}
      </span>
    </div>

    <!-- 2. 背景下半(旧数字,停留) -->
    <div class="absolute inset-x-0 h-1/2 overflow-hidden rounded-b-lg bg-inherit text-inherit translate-y-full">
      <span class="absolute left-0 right-0 flex w-full h-[200%] items-center justify-center" style="top: -100%;">
        {{ prevDigit }}
      </span>
    </div>

    <!-- 3. 上翻页(旧数字向下翻落) -->
    <div
      :class="cn(
        'absolute inset-x-0 h-1/2 overflow-hidden rounded-t-lg bg-inherit text-inherit top-0 z-20 origin-bottom backface-hidden',
        flipping && 'animate-flip-top',
      )"
    >
      <span class="absolute left-0 right-0 flex w-full h-[200%] items-center justify-center" style="top: 0%;">
        {{ prevDigit }}
      </span>
    </div>

    <!-- 4. 下翻页(新数字展开) -->
    <div
      :class="cn(
        'absolute inset-x-0 h-1/2 overflow-hidden rounded-b-lg bg-inherit text-inherit translate-y-full z-10 origin-top backface-hidden',
        flipping && 'animate-flip-bottom',
      )"
      style="transform: rotateX(90deg);"
    >
      <span class="absolute left-0 right-0 flex w-full h-[200%] items-center justify-center" style="top: -100%;">
        {{ props.digit }}
      </span>
    </div>

    <!-- 中线阴影 -->
    <div class="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-background/50 z-30" />
  </div>
</template>
