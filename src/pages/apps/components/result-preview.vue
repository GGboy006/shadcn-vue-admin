<script setup lang="ts">
import { DownloadIcon, RefreshCwIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'

interface Props {
  imageUrl: string
  prompt?: string
}

defineProps<Props>()

const emit = defineEmits<{
  regenerate: []
  download: []
  contact: []
}>()

function handleDownload() {
  emit('download')
}

function handleRegenerate() {
  emit('regenerate')
}
</script>

<template>
  <div class="flex flex-col items-center">
    <!-- 结果图片 -->
    <div class="relative w-full max-w-md rounded-xl overflow-hidden shadow-lg">
      <img
        :src="imageUrl"
        alt="生成结果"
        class="w-full h-auto object-cover"
      >
    </div>

    <!-- 操作按钮 -->
    <div class="flex items-center gap-3 mt-6">
      <Button variant="outline" @click="handleRegenerate">
        <RefreshCwIcon class="size-4 mr-2" />
        重新生成
      </Button>
      <Button @click="handleDownload">
        <DownloadIcon class="size-4 mr-2" />
        下载图片
      </Button>
    </div>

    <!-- 联系站长人工设计 -->
    <div class="mt-4 max-w-md w-full">
      <div
        class="flex items-center gap-2 px-4 py-3 rounded-lg bg-primary/5 border border-primary/10 cursor-pointer hover:bg-primary/10 transition-colors"
        @click="$emit('contact')"
      >
        <svg class="size-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span class="text-sm text-muted-foreground">对效果不满意？</span>
        <span class="text-sm font-medium text-primary">点击联系站长人工设计</span>
      </div>
    </div>
  </div>
</template>
