<script lang="ts" setup>
import { MessageSquareIcon } from '@lucide/vue'
import { computed } from 'vue'

import type { INeighborhoodLeaveMessage } from '@/services/api/neighborhood-leave-message.api'

import PropUiCopy from '@/components/prop-ui/copy/Copy.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const props = defineProps<{
  open: boolean
  message?: INeighborhoodLeaveMessage
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2 text-base">
          <MessageSquareIcon class="size-5" />
          留言详情
        </DialogTitle>
        <DialogDescription class="sr-only">
          查看留言完整内容
        </DialogDescription>
      </DialogHeader>

      <div v-if="message" class="space-y-6">
        <!-- 留言人信息 -->
        <div class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <div class="text-muted-foreground">
              姓名
            </div>
            <div class="font-medium">
              {{ message.name || '-' }}
            </div>
          </div>
          <div>
            <div class="text-muted-foreground">
              手机号
            </div>
            <div class="flex items-center gap-2 font-medium">
              <span>{{ message.phone || '-' }}</span>
              <PropUiCopy v-if="message.phone" :content="message.phone" size="sm" copy-tooltip-text="复制手机号" copied-tooltip-text="已复制" />
            </div>
          </div>
          <div>
            <div class="text-muted-foreground">
              留言时间
            </div>
            <div class="font-medium tabular-nums">
              {{ message.createTime || '-' }}
            </div>
          </div>
        </div>

        <!-- 留言内容 -->
        <div class="space-y-2">
          <div class="text-sm font-medium text-muted-foreground">
            留言内容
          </div>
          <div class="whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed">
            {{ message.message || '暂无内容' }}
          </div>
        </div>
      </div>

      <div v-else class="py-10 text-center text-sm text-muted-foreground">
        暂无数据
      </div>
    </DialogContent>
  </Dialog>
</template>
