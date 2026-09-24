<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import {
  FileCodeIcon,
  FileJsonIcon,
  FileTextIcon,
  ImageIcon,
  XIcon,
} from '@lucide/vue'

import { cn } from '@/lib/utils'

import ImageLightbox from './image-lightbox.vue'

const props = withDefaults(defineProps<{
  id: string
  filename: string
  size?: number
  isImage?: boolean
  url?: string
  class?: HTMLAttributes['class']
  display?: 'chip' | 'image-only'
  enableImagePreview?: boolean
  onRemove?: () => void
}>(), {
  display: 'chip',
  enableImagePreview: true,
})

const emit = defineEmits<{
  remove: []
}>()

type FileIconName = 'image' | 'code' | 'data' | 'text'

const isHovered = ref(false)
const isLightboxOpen = ref(false)
const iconName = computed(() => getFileIconName(props.filename, props.isImage))
const isImageOnly = computed(() => props.display === 'image-only' && !!props.isImage && !!props.url)
const canPreview = computed(() => Boolean(props.enableImagePreview && props.isImage && props.url))
const instance = getCurrentInstance()
const showRemove = computed(() =>
  typeof props.onRemove === 'function'
  || typeof instance?.vnode.props?.onRemove === 'function',
)

function formatFileSize(bytes: number): string {
  if (bytes < 1024)
    return `${bytes} B`
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIconName(filename: string, isImage?: boolean): FileIconName {
  if (isImage)
    return 'image'

  const ext = filename.split('.').pop()?.toLowerCase()

  if ([
    'js',
    'ts',
    'jsx',
    'tsx',
    'py',
    'rb',
    'go',
    'rs',
    'java',
    'kt',
    'swift',
    'c',
    'cpp',
    'h',
    'hpp',
    'cs',
    'php',
  ].includes(ext || '')) {
    return 'code'
  }

  if (['json', 'yaml', 'yml', 'xml'].includes(ext || ''))
    return 'data'

  return 'text'
}

function openLightbox(event: MouseEvent) {
  event.stopPropagation()
  isLightboxOpen.value = true
}

function handleRemove(event: MouseEvent) {
  event.stopPropagation()
  props.onRemove?.()
  emit('remove')
}
</script>

<template>
  <div
    :class="cn(
      '[--an-input-border-radius:16px] [--an-context-padding:10px]',
      'relative rounded-[calc(var(--an-input-border-radius)-var(--an-context-padding))] bg-muted/50',
      isImageOnly
        ? 'flex size-10 items-center justify-center'
        : 'flex min-w-[120px] max-w-[200px] items-center gap-2 py-1 pr-2 pl-1',
      props.class,
    )"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div
      v-if="isImageOnly"
      :class="cn(
        'size-8 shrink-0 overflow-hidden rounded-[calc(var(--an-input-border-radius)-var(--an-context-padding)-2px)]',
        canPreview && 'cursor-pointer',
      )"
      @click="canPreview ? openLightbox($event) : undefined"
    >
      <img
        :src="url"
        :alt="filename"
        class="size-full object-cover"
      >
    </div>

    <template v-else>
      <div
        v-if="isImage && url"
        :class="cn(
          'w-8 shrink-0 self-stretch overflow-hidden rounded-[calc(var(--an-input-border-radius)-var(--an-context-padding)-2px)]',
          canPreview && 'cursor-pointer',
        )"
        @click="canPreview ? openLightbox($event) : undefined"
      >
        <img
          :src="url"
          :alt="filename"
          class="size-full aspect-square object-cover"
        >
      </div>
      <div
        v-else
        class="flex w-8 shrink-0 items-center justify-center self-stretch rounded-[calc(var(--an-input-border-radius)-var(--an-context-padding)-2px)] bg-muted"
      >
        <ImageIcon v-if="iconName === 'image'" class="size-4 text-muted-foreground" />
        <FileCodeIcon v-else-if="iconName === 'code'" class="size-4 text-muted-foreground" />
        <FileJsonIcon v-else-if="iconName === 'data'" class="size-4 text-muted-foreground" />
        <FileTextIcon v-else class="size-4 text-muted-foreground" />
      </div>

      <div class="flex min-w-0 flex-col">
        <span
          class="truncate text-sm font-medium text-foreground"
          :title="filename"
        >
          {{ filename }}
        </span>
        <span
          v-if="size !== undefined"
          class="text-[10px] text-muted-foreground"
        >
          {{ formatFileSize(size) }}
        </span>
      </div>
    </template>

    <button
      v-if="showRemove"
      type="button"
      aria-label="移除文件"
      :class="cn(
        'absolute -top-1.5 -right-1.5 z-10 flex size-4 items-center justify-center rounded-full border border-border bg-background',
        'text-muted-foreground transition-[opacity,transform] duration-150 ease-out hover:text-foreground active:scale-[0.97]',
        isHovered ? 'opacity-100' : 'opacity-0',
      )"
      @click="handleRemove"
    >
      <XIcon class="size-3" />
    </button>

    <ImageLightbox
      v-if="canPreview && url"
      :open="isLightboxOpen"
      :images="[{ id, url, filename }]"
      @close="isLightboxOpen = false"
    />
  </div>
</template>
