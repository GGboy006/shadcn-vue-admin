<script setup lang="ts">
import { ImagePlusIcon, XIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import { useUpload } from '@/composables/use-upload'

/**
 * 多图上传组件(Q5:基于 useUpload 自做)。
 *
 * v-model 绑定 string[](URL 数组),逐张上传,支持预览/删除。
 */
const props = withDefaults(defineProps<{
  /** 最多图片数量 */
  max?: number
  /** 单图大小限制(MB) */
  maxSize?: number
}>(), {
  max: 9,
  maxSize: 10,
})

const modelValue = defineModel<string[]>({ default: () => [] })

const { upload, loading } = useUpload({ maxSize: props.maxSize })

async function handleUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files ?? [])
  if (!files.length)
    return

  if (modelValue.value.length + files.length > props.max) {
    toast.error(`最多上传 ${props.max} 张图片`)
    target.value = ''
    return
  }

  try {
    const urls: string[] = []
    for (const file of files) {
      const url = await upload(file)
      urls.push(url)
    }
    modelValue.value = [...modelValue.value, ...urls]
  }
  catch {
    // error handled by useUpload
  }
  finally {
    target.value = ''
  }
}

function handleRemove(index: number) {
  modelValue.value = modelValue.value.filter((_, i) => i !== index)
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <div v-for="(url, index) in modelValue" :key="index" class="relative group">
      <img :src="url" alt="图片" class="h-20 w-20 rounded object-cover border">
      <button
        type="button"
        class="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        @click="handleRemove(index)"
      >
        <XIcon class="size-3" />
      </button>
    </div>

    <label
      v-if="modelValue.length < max"
      class="h-20 w-20 rounded border border-dashed flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
      :class="{ 'pointer-events-none opacity-50': loading }"
    >
      <ImagePlusIcon class="size-5" />
      <span>{{ loading ? '上传中' : '上传' }}</span>
      <input type="file" accept="image/*" multiple class="sr-only" @change="handleUpload">
    </label>
  </div>
</template>
