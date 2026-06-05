<script setup lang="ts">
import { SparklesIcon, TimerIcon } from '@lucide/vue'
import { onUnmounted, ref, watch } from 'vue'

interface Props {
  stepName?: string
  streamingContent?: string
}

const props = withDefaults(defineProps<Props>(), {
  stepName: '生成中',
})

const timerDisplay = ref('00:00')
const timerSeconds = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function startTimer() {
  if (timerInterval)
    return
  timerSeconds.value = 0
  timerDisplay.value = '00:00'
  timerInterval = setInterval(() => {
    timerSeconds.value++
    timerDisplay.value = formatTime(timerSeconds.value)
  }, 1000)
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

watch(() => props.streamingContent, (newVal, oldVal) => {
  if (!oldVal && newVal) {
    startTimer()
  }
}, { immediate: true })

onUnmounted(() => {
  stopTimer()
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16">
    <!-- 动画区域 -->
    <div class="relative mb-6">
      <div class="flex size-20 items-center justify-center rounded-full bg-primary/10">
        <SparklesIcon class="size-10 text-primary animate-pulse" />
      </div>
      <div class="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
    </div>

    <!-- 标题 -->
    <h3 class="text-lg font-semibold mb-2">
      {{ stepName }}
    </h3>

    <!-- 描述 -->
    <p class="text-sm text-muted-foreground mb-4">
      AI 正在为您创作，请稍候...
    </p>

    <!-- 流式内容预览 -->
    <div
      v-if="streamingContent"
      class="max-w-md w-full rounded-lg bg-muted p-4 text-xs text-muted-foreground line-clamp-4"
    >
      {{ streamingContent }}
    </div>

    <!-- 计时器 -->
    <div
      v-if="timerSeconds > 0"
      class="mt-4 flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-mono font-medium text-primary"
    >
      <TimerIcon class="size-4" />
      <span>{{ timerDisplay }}</span>
    </div>

    <!-- 加载条 -->
    <div class="mt-6 w-48 h-1 rounded-full bg-muted overflow-hidden">
      <div class="h-full bg-primary animate-[loading_1.5s_ease-in-out_infinite]" />
    </div>
  </div>
</template>

<style scoped>
@keyframes loading {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
}
</style>
