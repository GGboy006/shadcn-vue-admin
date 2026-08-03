<script lang="ts" setup>
import type { VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'vue'

import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

import FlipUnit from './FlipUnit.vue'

const props = withDefaults(defineProps<{
  /** 尺寸:sm 紧凑 / md 标准 / lg 主视觉 / xl 落地页 */
  size?: FlipClockSize
  /** 颜色变体,沿用 shadcn 语义色 */
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'muted'
  class?: HTMLAttributes['class']
}>(), {
  size: 'md',
  variant: 'default',
})

/** 整个时钟容器的尺寸变体(含间距) */
const flipClockVariants = cva(
  'relative flex justify-center items-center font-mono font-medium',
  {
    variants: {
      size: {
        mini: 'text-xl space-x-0.5',
        sm: 'text-3xl space-x-1',
        md: 'text-5xl space-x-2',
        lg: 'text-6xl space-x-2',
        xl: 'text-8xl space-x-3',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

type FlipClockSize = VariantProps<typeof flipClockVariants>['size']

/** 分隔符字号随尺寸变化 */
const heightMap: Record<NonNullable<FlipClockSize>, string> = {
  mini: 'text-2xl',
  sm: 'text-4xl',
  md: 'text-5xl',
  lg: 'text-6xl',
  xl: 'text-8xl',
}

/** 当前时间 */
const time = ref({ hours: 0, minutes: 0, seconds: 0 })

function syncTime() {
  const now = new Date()
  const next = {
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
  }
  // 仅在秒数实际变化时更新,避免无谓重渲染
  if (next.seconds !== time.value.seconds || next.minutes !== time.value.minutes)
    time.value = next
}

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  syncTime()
  // 250ms 心跳,足以立即捕获秒翻转
  timer = setInterval(syncTime, 250)
})

onUnmounted(() => {
  if (timer)
    clearInterval(timer)
})

const hoursStr = computed(() => String(time.value.hours).padStart(2, '0'))
const minutesStr = computed(() => String(time.value.minutes).padStart(2, '0'))
const secondsStr = computed(() => String(time.value.seconds).padStart(2, '0'))
</script>

<template>
  <div
    :class="cn(flipClockVariants({ size: props.size }), props.class)"
    aria-live="polite"
  >
    <!-- 屏幕阅读器朗读用 -->
    <span class="sr-only absolute">
      {{ `${time.hours}:${time.minutes}:${time.seconds}` }}
    </span>

    <!-- 时 -->
    <FlipUnit
      v-for="(digit, i) in hoursStr"
      :key="`h-${i}`"
      :digit="digit"
      :size="props.size"
      :variant="props.variant"
    />

    <span :class="cn('text-center -translate-y-[8%]', heightMap[props.size!])">:</span>

    <!-- 分 -->
    <FlipUnit
      v-for="(digit, i) in minutesStr"
      :key="`m-${i}`"
      :digit="digit"
      :size="props.size"
      :variant="props.variant"
    />

    <span :class="cn('text-center -translate-y-[8%]', heightMap[props.size!])">:</span>

    <!-- 秒 -->
    <FlipUnit
      v-for="(digit, i) in secondsStr"
      :key="`s-${i}`"
      :digit="digit"
      :size="props.size"
      :variant="props.variant"
    />
  </div>
</template>

<style>
/* 翻牌动画:上半页向下翻 + 下半页展开,0.6s 同步 */
.animate-flip-top {
  animation: flip-top-anim 0.6s ease-in forwards;
}
.animate-flip-bottom {
  animation: flip-bottom-anim 0.6s ease-out forwards;
}

@keyframes flip-top-anim {
  0% {
    transform: rotateX(0deg);
    z-index: 30;
  }
  50%,
  100% {
    transform: rotateX(-90deg);
    z-index: 10;
  }
}

@keyframes flip-bottom-anim {
  0%,
  50% {
    transform: rotateX(90deg);
    z-index: 10;
  }
  100% {
    transform: rotateX(0deg);
    z-index: 30;
  }
}
</style>
