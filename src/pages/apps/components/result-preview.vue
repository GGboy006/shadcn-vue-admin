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

    <!-- Prompt 展示（可选） -->
    <div v-if="prompt" class="mt-4 max-w-md w-full">
      <p class="text-xs text-muted-foreground text-center line-clamp-2">
        {{ prompt }}
      </p>
    </div>
  </div>
</template>
