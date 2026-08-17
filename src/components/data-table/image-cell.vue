<script setup lang="ts">
import { ref, watch } from 'vue'

import { cn } from '@/lib/utils'

interface DataTableImageCellProps {
  src?: string | null
  alt?: string
  /** square = 直角矩形(封面/logo/图标),circle = 圆形(头像) */
  shape?: 'square' | 'circle'
  /** Tailwind 尺寸类,如 'size-9'、'h-10 w-16' */
  size?: string
  /** 无图 / 加载失败时的占位文案 */
  placeholder?: string
}

const props = withDefaults(defineProps<DataTableImageCellProps>(), {
  shape: 'square',
  size: 'size-9',
  placeholder: '无',
})

const failed = ref(false)
watch(() => props.src, () => {
  failed.value = false
})
</script>

<template>
  <img
    v-if="src && !failed"
    :src="src"
    :alt="alt || ''"
    :class="cn(size, 'shrink-0 border object-cover', shape === 'circle' ? 'rounded-full' : 'rounded')"
    @error="failed = true"
  >
  <div
    v-else
    :class="cn(size, 'flex shrink-0 items-center justify-center bg-muted text-xs text-muted-foreground', shape === 'circle' ? 'rounded-full' : 'rounded')"
  >
    {{ placeholder }}
  </div>
</template>
