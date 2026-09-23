<script setup lang="ts">
import { DownloadIcon } from '@lucide/vue'
import { computed } from 'vue'

import type { ImageGenerationCard } from '@/utils/image-generation-card'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetAiImageGenerationCardQuery } from '@/services/api/conversation.api'
import { downloadImage } from '@/utils/download-image'

const props = defineProps<{
  card: ImageGenerationCard
}>()

const imageGenerationId = computed(() => props.card.imageGenerationId)
const poll = useGetAiImageGenerationCardQuery(imageGenerationId, props.card.size)

const status = computed(() => poll.data.value?.status ?? 0)
const imageUrl = computed(() => poll.data.value?.imageUrl || '')
const size = computed(() => poll.data.value?.size || props.card.size)
const generating = computed(() => status.value === 0 && !poll.isError.value)
const fetching = computed(() => poll.isFetching.value)

function parseAspectRatio(value: string | undefined): number {
  if (!value)
    return 3 / 4
  const match = value.match(/(\d+)\s*[:x×*]\s*(\d+)/i)
  if (!match)
    return 3 / 4
  const width = Number.parseInt(match[1], 10)
  const height = Number.parseInt(match[2], 10)
  if (height <= 0)
    return 3 / 4
  return width / height
}

function onView() {
  if (imageUrl.value) {
    window.open(imageUrl.value, '_blank', 'noopener')
    return
  }
  void poll.refetch()
}

function onDownload() {
  if (!imageUrl.value)
    return
  downloadImage(imageUrl.value, props.card.title || `poster-${props.card.imageGenerationId}`)
}
</script>

<template>
  <div class="mt-2 w-56 space-y-2 rounded-lg border bg-background p-3">
    <p class="text-sm font-medium">
      {{ card.title }}
    </p>

    <div v-if="generating" class="space-y-2">
      <AspectRatio
        :ratio="parseAspectRatio(size)"
        class="overflow-hidden rounded-md"
      >
        <Skeleton class="size-full rounded-md" />
      </AspectRatio>
      <p class="text-xs text-muted-foreground">
        {{ card.summary || '海报生成中' }}
      </p>
    </div>

    <AspectRatio
      v-else-if="status === 1 && imageUrl"
      :ratio="parseAspectRatio(size)"
      class="overflow-hidden rounded-md bg-muted"
    >
      <img
        :src="imageUrl"
        :alt="card.title"
        class="h-full w-full object-cover"
      >
    </AspectRatio>

    <p
      v-else
      class="text-xs text-destructive"
    >
      海报生成失败
    </p>

    <div class="flex gap-2">
      <Button
        variant="secondary"
        size="sm"
        class="flex-1"
        :disabled="generating && fetching"
        @click="onView"
      >
        {{ card.actionLabel }}
      </Button>
      <Button
        v-if="status === 1 && imageUrl"
        variant="outline"
        size="sm"
        @click="onDownload"
      >
        <DownloadIcon class="size-4" />
        <span class="sr-only">下载海报</span>
      </Button>
    </div>
  </div>
</template>
