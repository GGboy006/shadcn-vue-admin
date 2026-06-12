<script setup lang="ts">
import { Loader2Icon } from '@lucide/vue'
import { computed } from 'vue'

import type { AgentVision } from '@/services/api/skill.api'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { useAgentVision } from '../composables/use-agent-vision'

interface Props {
  vision: AgentVision
  chatId: string
  contentId?: string
  content: string
}

const props = defineProps<Props>()

const {
  visionContent,
  isLoading,
  isDone,
  error,
  pptState,
  downloadPPT,
  downloadWord,
} = useAgentVision({
  vision: props.vision,
  chatId: props.chatId,
  contentId: props.contentId,
  content: props.content,
})

/** 清理 HTML 内容，去掉可能的 markdown 代码块标记 */
const cleanHtmlContent = computed(() => {
  return visionContent.value
    .replace(/^```html\s*/i, '')
    .replace(/```\s*$/, '')
    .trim()
})

/** 当前是否为 PPT */
const isPPT = computed(() => props.vision.visionType === 2)

/** PPT 状态文本 */
const pptStatusText = computed(() => {
  switch (pptState.value) {
    case 'streaming':
      return '正在生成内容...'
    case 'converting':
      return '正在转换 PPT...'
    case 'polling':
      return 'PPT 生成中，请稍候...'
    case 'ready':
      return 'PPT 已生成'
    case 'error':
      return 'PPT 生成失败'
    default:
      return ''
  }
})

/** 是否显示下载按钮 */
const showDownload = computed(() => {
  if (isPPT.value)
    return pptState.value === 'ready'
  return isDone.value && !!visionContent.value
})

/** 点击下载 */
async function handleDownload() {
  if (isPPT.value) {
    await downloadPPT()
  }
  else {
    await downloadWord()
  }
}
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- 加载中 -->
    <div v-if="isLoading && !error" class="flex flex-1 flex-col items-center justify-center space-y-4 p-8">
      <Loader2Icon class="size-8 animate-spin text-muted-foreground" />
      <p class="text-sm text-muted-foreground">
        {{ isPPT ? '正在生成 PPT 内容...' : '正在生成内容...' }}
      </p>
    </div>

    <!-- 错误 -->
    <div v-else-if="error" class="flex flex-1 flex-col items-center justify-center p-8 text-center">
      <p class="text-sm text-destructive">
        {{ error }}
      </p>
    </div>

    <!-- PPT 生成状态 -->
    <div v-else-if="isPPT && pptState !== 'idle' && pptState !== 'ready'" class="flex flex-1 flex-col items-center justify-center space-y-4 p-8">
      <Loader2Icon v-if="pptState !== 'error'" class="size-8 animate-spin text-muted-foreground" />
      <p class="text-sm text-muted-foreground">
        {{ pptStatusText }}
      </p>
    </div>

    <!-- 内容预览 -->
    <div v-else-if="visionContent" class="flex flex-1 flex-col overflow-hidden">
      <iframe
        :srcdoc="cleanHtmlContent"
        class="flex-1 w-full border-0"
        title="vision-preview"
      />
    </div>

    <!-- 空状态 -->
    <div v-else class="flex flex-1 flex-col items-center justify-center p-8">
      <p class="text-sm text-muted-foreground">
        暂无内容
      </p>
    </div>

    <!-- 底部操作栏 -->
    <div class="border-t p-4 shrink-0">
      <Button
        v-if="showDownload"
        class="w-full"
        size="sm"
        @click="handleDownload"
      >
        {{ isPPT ? '下载 PPT' : '下载 Word' }}
      </Button>
      <Skeleton v-else-if="isLoading || (isPPT && pptState !== 'idle' && pptState !== 'error')" class="h-9 w-full" />
    </div>
  </div>
</template>
