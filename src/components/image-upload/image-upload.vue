<script setup lang="ts">
import { LoaderIcon } from '@lucide/vue'

import { useUpload } from '@/composables/use-upload'
import { cn } from '@/lib/utils'

/**
 * 单图上传：预览 + 本地选图，走 OSS，v-model 绑定图片 URL。
 */
const props = withDefaults(defineProps<{
  alt?: string
  /** square 图标/封面，circle 头像 */
  shape?: 'square' | 'circle'
  previewClass?: string
}>(), {
  alt: '图片',
  shape: 'square',
  previewClass: '',
})

const modelValue = defineModel<string | null | undefined>({ default: undefined })

const { upload, loading } = useUpload()

const previewCls = computed(() => {
  if (props.previewClass)
    return props.previewClass
  return props.shape === 'circle'
    ? 'size-16 rounded-full border object-cover'
    : 'size-16 rounded border object-cover'
})

const emptyCls = computed(() => cn(
  'flex items-center justify-center bg-muted text-xs text-muted-foreground',
  previewCls.value.replace('object-cover', ''),
))

async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file)
    return
  try {
    const url = await upload(file)
    modelValue.value = url
  }
  catch {
    // error handled by useUpload
  }
  finally {
    target.value = ''
  }
}
</script>

<template>
  <div class="flex items-center gap-3">
    <img v-if="modelValue" :src="modelValue" :alt="alt" :class="previewCls">
    <div v-else :class="emptyCls">
      无
    </div>
    <label
      class="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
      :class="{ 'pointer-events-none opacity-50': loading }"
    >
      <LoaderIcon v-if="loading" class="size-4 animate-spin" />
      <span>{{ loading ? '上传中' : '上传' }}</span>
      <input type="file" accept="image/*" class="sr-only" :disabled="loading" @change="handleFileUpload">
    </label>
  </div>
</template>
