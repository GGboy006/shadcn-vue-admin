<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { CornerDownLeftIcon, ImageIcon, PlusIcon, SquareIcon } from '@lucide/vue'
import { computed } from 'vue'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from '@/components/ui/input-group'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  /** ready 可发送；streaming 时按钮改为停止 */
  status?: 'ready' | 'streaming'
  /** 加号打开「添加照片或文件」 */
  attachment?: boolean
  /** 已有待发送附件时，允许空文本发送 */
  canSubmitExtra?: boolean
  class?: HTMLAttributes['class']
}>(), {
  modelValue: '',
  placeholder: '输入消息...',
  disabled: false,
  status: 'ready',
  attachment: false,
  canSubmitExtra: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'submit': []
  'stop': []
  /** 选择「添加照片或文件」 */
  'pickAttachments': []
}>()

const streaming = computed(() => props.status === 'streaming')
const canSend = computed(() =>
  (props.modelValue.trim().length > 0 || props.canSubmitExtra) && !props.disabled && !streaming.value,
)

function onSubmit() {
  if (!canSend.value)
    return
  emit('submit')
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing)
    return
  event.preventDefault()
  if (streaming.value)
    return
  onSubmit()
}

function onStopClick(event: MouseEvent) {
  event.preventDefault()
  emit('stop')
}
</script>

<template>
  <form
    :class="cn('w-full', props.class)"
    @submit.prevent="onSubmit"
  >
    <InputGroup class="overflow-hidden">
      <div v-if="$slots.header" class="order-first w-full px-3 pt-3">
        <slot name="header" />
      </div>

      <InputGroupTextarea
        :model-value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        class="max-h-48 min-h-10 py-2"
        @update:model-value="emit('update:modelValue', String($event))"
        @keydown="onKeydown"
      />

      <InputGroupAddon align="block-end" class="justify-between gap-1">
        <div class="flex min-w-0 items-center gap-1">
          <slot name="tools">
            <DropdownMenu v-if="attachment">
              <DropdownMenuTrigger as-child>
                <InputGroupButton
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="添加附件"
                  :disabled="disabled"
                >
                  <PlusIcon class="size-4" />
                </InputGroupButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start">
                <DropdownMenuItem @select="emit('pickAttachments')">
                  <ImageIcon />
                  添加照片或文件
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </slot>
        </div>

        <InputGroupButton
          v-if="streaming"
          type="button"
          variant="default"
          size="icon-sm"
          aria-label="停止生成"
          @click="onStopClick"
        >
          <SquareIcon class="size-4" />
        </InputGroupButton>
        <InputGroupButton
          v-else
          type="submit"
          variant="default"
          size="icon-sm"
          aria-label="发送"
          :disabled="!canSend"
        >
          <CornerDownLeftIcon class="size-4" />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  </form>
</template>
