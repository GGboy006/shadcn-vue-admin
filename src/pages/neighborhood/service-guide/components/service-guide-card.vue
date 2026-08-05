<script lang="ts" setup>
import { PencilIcon, PhoneIcon, Trash2Icon } from '@lucide/vue'

import type { INeighborhoodServiceGuide } from '@/services/api/neighborhood-service-guide.api'

import PropUiCopy from '@/components/prop-ui/copy/Copy.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import { Button } from '@/components/ui/button'
import { serviceGuideEnableStatusConfig } from '@/services/api/neighborhood-service-guide.api'

const { guide } = defineProps<{
  guide: INeighborhoodServiceGuide
}>()

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'delete'): void
}>()

const enableConfig = computed(() => {
  const status = guide.isEnable
  if (status === undefined || status === null)
    return undefined
  return serviceGuideEnableStatusConfig[status]
})
</script>

<template>
  <div class="flex flex-col gap-3 rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors">
    <!-- 顶部:电话图标 + 单位 + 操作 -->
    <div class="flex items-start justify-between gap-2">
      <div class="flex min-w-0 flex-1 items-start gap-3">
        <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <PhoneIcon class="size-5" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <h3 class="truncate text-base font-medium">
              {{ guide.unit || '未命名单位' }}
            </h3>
            <Badge v-if="enableConfig" :variant="enableConfig.variant">
              {{ enableConfig.label }}
            </Badge>
          </div>
          <!-- 电话 + 复制 -->
          <div v-if="guide.phone" class="mt-1 flex items-center gap-2">
            <span class="text-sm font-medium text-primary">{{ guide.phone }}</span>
            <PropUiCopy :content="guide.phone" size="sm" copy-tooltip-text="复制电话" copied-tooltip-text="已复制" />
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
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

    <!-- 地址 + 描述 -->
    <div class="space-y-1 text-sm text-muted-foreground">
      <div v-if="guide.address" class="flex items-center gap-1">
        <span class="shrink-0">地址:</span>
        <span class="truncate">{{ guide.address }}</span>
      </div>
      <div v-if="guide.describe">
        {{ guide.describe }}
      </div>
    </div>
  </div>
</template>
