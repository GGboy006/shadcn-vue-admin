<script setup lang="ts">
import { AlertCircleIcon, ClockIcon, RefreshCwIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'

withDefaults(defineProps<{
  /** 面向用户的错误说明 */
  message?: string
  /** 是否超时类失败（文案/图标略不同） */
  isTimeout?: boolean
  stepName?: string
}>(), {
  message: '生成失败，请稍后重试',
  isTimeout: false,
  stepName: '生成海报',
})

const emit = defineEmits<{
  regenerate: []
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div
      class="mb-5 flex size-16 items-center justify-center rounded-full"
      :class="isTimeout ? 'bg-amber-500/10 text-amber-600' : 'bg-destructive/10 text-destructive'"
    >
      <ClockIcon v-if="isTimeout" class="size-8" />
      <AlertCircleIcon v-else class="size-8" />
    </div>

    <h3 class="mb-2 text-lg font-semibold">
      {{ isTimeout ? '生成超时' : '生成失败' }}
    </h3>

    <p class="mb-1 max-w-sm text-sm text-muted-foreground leading-relaxed">
      {{ message }}
    </p>
    <p v-if="isTimeout" class="mb-6 max-w-sm text-xs text-muted-foreground">
      高峰期可能需要 1～2 分钟，请稍后再试，配置会保留。
    </p>
    <div v-else class="mb-6" />

    <Button class="min-w-40" @click="emit('regenerate')">
      <RefreshCwIcon class="size-4" />
      重新生成
    </Button>
  </div>
</template>
