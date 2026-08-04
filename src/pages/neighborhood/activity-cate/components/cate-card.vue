<script lang="ts" setup>
import { PencilIcon, Trash2Icon } from '@lucide/vue'

import type { INeighborhoodCate } from '@/services/api/neighborhood-cate.api'

import Badge from '@/components/ui/badge/Badge.vue'
import { Button } from '@/components/ui/button'
import { cateEnableStatusConfig } from '@/services/api/neighborhood-cate.api'

const { cate } = defineProps<{
  cate: INeighborhoodCate
}>()

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'delete'): void
}>()

const enableConfig = computed(() => {
  const status = cate.isEnable
  if (status === undefined || status === null)
    return undefined
  return cateEnableStatusConfig[status]
})
</script>

<template>
  <div class="flex items-center justify-between gap-3 rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors">
    <!-- 左侧:分类信息 -->
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <h3 class="truncate text-base font-medium">
          {{ cate.name }}
        </h3>
        <Badge v-if="enableConfig" :variant="enableConfig.variant">
          {{ enableConfig.label }}
        </Badge>
      </div>
      <div class="mt-1.5 flex items-center gap-4 text-xs text-muted-foreground">
        <span>排序:{{ cate.torder ?? '-' }}</span>
      </div>
    </div>

    <!-- 右侧:操作按钮 -->
    <div class="flex shrink-0 items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        class="size-8"
        title="编辑"
        @click="emit('edit')"
      >
        <PencilIcon class="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        class="size-8 text-destructive hover:text-destructive"
        title="删除"
        @click="emit('delete')"
      >
        <Trash2Icon class="size-4" />
      </Button>
    </div>
  </div>
</template>
