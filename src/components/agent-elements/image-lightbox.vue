<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from '@lucide/vue'
import { useEventListener } from '@vueuse/core'

import { cn } from '@/lib/utils'

export interface LightboxImage {
  id: string
  url: string
  filename?: string
}

const props = withDefaults(defineProps<{
  open: boolean
  images: LightboxImage[]
  initialIndex?: number
}>(), {
  initialIndex: 0,
})

const emit = defineEmits<{
  close: []
}>()

const currentIndex = ref(props.initialIndex)
const hasMultipleImages = computed(() => props.images.length > 1)
const currentImage = computed(() => props.images[currentIndex.value] ?? props.images[0])

watch(
  () => [props.open, props.initialIndex] as const,
  ([open, initialIndex]) => {
    if (open)
      currentIndex.value = initialIndex
  },
)

function close() {
  emit('close')
}

function goToPrevious(event?: MouseEvent) {
  event?.stopPropagation()
  currentIndex.value = currentIndex.value > 0 ? currentIndex.value - 1 : props.images.length - 1
}

function goToNext(event?: MouseEvent) {
  event?.stopPropagation()
  currentIndex.value = currentIndex.value < props.images.length - 1 ? currentIndex.value + 1 : 0
}

function goTo(index: number, event?: MouseEvent) {
  event?.stopPropagation()
  currentIndex.value = index
}

function onKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      event.stopPropagation()
      close()
      break
    case 'ArrowLeft':
      if (hasMultipleImages.value)
        goToPrevious()
      break
    case 'ArrowRight':
      if (hasMultipleImages.value)
        goToNext()
      break
  }
}

useEventListener(window, 'keydown', (event: KeyboardEvent) => {
  if (!props.open)
    return
  onKeydown(event)
}, { capture: true })

watchEffect((onCleanup) => {
  if (!props.open)
    return
  const previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  onCleanup(() => {
    document.body.style.overflow = previousOverflow
  })
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && currentImage?.url"
      role="dialog"
      aria-modal="true"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      @click="close"
    >
      <button
        type="button"
        aria-label="关闭全屏预览"
        class="absolute top-4 right-4 z-10 inline-flex size-9 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
        @click="close"
      >
        <XIcon class="size-4" />
      </button>

      <button
        v-if="hasMultipleImages"
        type="button"
        aria-label="上一张"
        class="absolute top-1/2 left-4 z-10 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
        @click="goToPrevious"
      >
        <ChevronLeftIcon class="size-5" />
      </button>

      <img
        :src="currentImage.url"
        :alt="currentImage.filename || '图片预览'"
        class="max-h-[85vh] max-w-[90vw] object-contain select-none"
        draggable="false"
        @click.stop
      >

      <button
        v-if="hasMultipleImages"
        type="button"
        aria-label="下一张"
        class="absolute top-1/2 right-4 z-10 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
        @click="goToNext"
      >
        <ChevronRightIcon class="size-5" />
      </button>

      <div
        v-if="hasMultipleImages"
        class="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        @click.stop
      >
        <div class="flex items-center gap-2">
          <button
            v-for="(_, index) in images"
            :key="index"
            type="button"
            :aria-label="`第 ${index + 1} 张`"
            :class="cn(
              'size-2 rounded-full transition-all',
              index === currentIndex ? 'scale-125 bg-white' : 'bg-white/40 hover:bg-white/60',
            )"
            @click="goTo(index, $event)"
          />
        </div>
        <span class="text-xs text-white/80">{{ currentIndex + 1 }} / {{ images.length }}</span>
      </div>
    </div>
  </Teleport>
</template>
