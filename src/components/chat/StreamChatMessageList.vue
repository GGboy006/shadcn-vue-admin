<script setup lang="ts">
import { MessageSquareIcon } from '@lucide/vue'
import dayjs from 'dayjs'
import { computed, useSlots } from 'vue'

import type { IChatMessage } from '@/services/api/conversation.api'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

import StreamMarkdownContent from './StreamMarkdownContent.vue'

interface Props {
  messages: IChatMessage[]
  /** 空状态提示文案 */
  emptyText?: string
  /** 是否正在流式生成中 */
  streaming?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  emptyText: '暂无消息',
  streaming: false,
})

const slots = useSlots()
const hasHeaderSlot = computed(() => !!slots.header)

/** 最后一条 AI 消息的索引 */
const lastAssistantIndex = computed(() => {
  let lastIndex = -1
  for (let i = 0; i < props.messages.length; i++) {
    if (!isUser(props.messages[i])) {
      lastIndex = i
    }
  }
  return lastIndex
})

// ==================== 消息辅助函数 ====================

/** 判断是否为用户消息 */
function isUser(msg: IChatMessage) {
  return msg.role === 'user'
}

/** 格式化时间 */
function formatTime(time: string) {
  return dayjs(time).format('HH:mm')
}
</script>

<template>
  <div class="relative flex flex-1 flex-col overflow-y-hidden px-4">
    <div
      class="flex grow flex-col-reverse justify-start gap-4 overflow-y-auto py-4 pe-4"
      aria-live="polite"
      aria-atomic="true"
    >
      <!-- 空状态 -->
      <template v-if="messages.length === 0 && !hasHeaderSlot">
        <div class="flex flex-1 flex-col items-center justify-center space-y-4 py-20">
          <div class="flex size-16 items-center justify-center rounded-full border-2 border-border">
            <MessageSquareIcon class="size-8" />
          </div>
          <div class="space-y-2 text-center">
            <h1 class="text-xl font-semibold">
              开始对话
            </h1>
            <p class="text-sm text-muted-foreground">
              {{ emptyText }}
            </p>
          </div>
        </div>
      </template>

      <!-- 消息列表 -->
      <template v-else>
        <div
          v-for="(msg, index) in messages"
          :key="msg.id"
          :class="cn(
            'flex w-fit max-w-[85%] sm:max-w-[75%] gap-2 shrink-0',
            isUser(msg) ? 'ml-auto flex-row-reverse' : 'mr-auto',
          )"
        >
          <!-- AI 头像 -->
          <Avatar v-if="!isUser(msg)" class="mt-1 size-8 shrink-0">
            <AvatarImage src="/robot.png" alt="AI" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <!-- 用户头像 -->
          <Avatar v-else class="mt-1 size-8 shrink-0">
            <AvatarFallback>用户</AvatarFallback>
          </Avatar>

          <!-- 消息内容 -->
          <div class="flex flex-col min-w-0 overflow-hidden">
            <div
              :class="cn(
                'rounded-2xl px-4 py-2.5 text-sm min-w-0',
                isUser(msg)
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : 'bg-muted rounded-tl-sm',
              )"
            >
              <!-- 用户消息：纯文本 -->
              <template v-if="isUser(msg)">
                <p v-if="msg.content || msg.finalContent" class="whitespace-pre-wrap">
                  {{ msg.content || msg.finalContent }}
                </p>
              </template>

              <!-- AI 消息：流式增量 Markdown 渲染 -->
              <template v-else>
                <StreamMarkdownContent
                  v-if="msg.content || msg.finalContent"
                  :content="msg.content || msg.finalContent"
                  :is-streaming="streaming && index === lastAssistantIndex"
                />
                <!-- 流式加载动画 -->
                <div v-else class="flex items-center gap-1.5 py-1" aria-label="AI 正在输入">
                  <span class="sr-only">AI 正在输入</span>
                  <span class="size-1.5 rounded-full bg-current animate-bounce" style="animation-delay: 0ms" />
                  <span class="size-1.5 rounded-full bg-current animate-bounce" style="animation-delay: 150ms" />
                  <span class="size-1.5 rounded-full bg-current animate-bounce" style="animation-delay: 300ms" />
                </div>
              </template>
            </div>

            <!-- 时间 -->
            <span
              :class="cn(
                'mt-1 text-xs text-muted-foreground',
                isUser(msg) ? 'text-right' : 'text-left',
              )"
            >
              {{ formatTime(msg.createTime) }}
            </span>
          </div>
        </div>
      </template>

      <!-- 顶部插槽：由于 flex-col-reverse，DOM 末尾的内容显示在视觉顶部 -->
      <slot name="header" />
    </div>
  </div>
</template>
