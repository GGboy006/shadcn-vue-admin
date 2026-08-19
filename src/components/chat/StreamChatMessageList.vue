<script setup lang="ts">
import { ArrowDownIcon, ClipboardCheckIcon, ClipboardIcon, MessageSquareIcon } from '@lucide/vue'
import { useClipboard } from '@vueuse/core'
import dayjs from 'dayjs'
import { computed, useSlots } from 'vue'

import type { IChatMessage } from '@/services/api/conversation.api'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { withBase } from '@/utils/with-base'

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
const isEmpty = computed(() => props.messages.length === 0 && !hasHeaderSlot.value)
const { copy, copied } = useClipboard()

/** 最后一条 AI 消息的索引 */
const lastAssistantIndex = computed(() => {
  let lastIndex = -1
  for (let i = 0; i < props.messages.length; i++) {
    if (!isUser(props.messages[i]))
      lastIndex = i
  }
  return lastIndex
})

/** 复制消息内容 */
function copyMessageContent(content: string) {
  if (!content)
    return
  copy(content)
}

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
  <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden px-4">
    <!-- 空状态 -->
    <div
      v-if="isEmpty"
      class="flex flex-1 flex-col items-center justify-center space-y-4 py-20"
    >
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

    <MessageScrollerProvider
      v-else
      auto-scroll
      default-scroll-position="end"
    >
      <MessageScroller>
        <MessageScrollerViewport aria-label="消息列表">
          <MessageScrollerContent
            :aria-busy="streaming"
            class="gap-4 py-4 pe-4"
          >
            <div v-if="hasHeaderSlot" class="shrink-0">
              <slot name="header" />
            </div>

            <MessageScrollerItem
              v-for="(msg, index) in messages"
              :key="msg.id"
              :message-id="msg.id"
              :scroll-anchor="isUser(msg)"
              :class="cn(
                'flex w-fit max-w-[85%] sm:max-w-[75%] gap-2',
                isUser(msg) ? 'ml-auto flex-row-reverse' : 'mr-auto',
              )"
            >
              <Avatar v-if="!isUser(msg)" class="mt-1 size-8 shrink-0">
                <AvatarImage :src="withBase('/robot.png')" alt="AI" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <Avatar v-else class="mt-1 size-8 shrink-0">
                <AvatarFallback>用户</AvatarFallback>
              </Avatar>

              <div class="flex min-w-0 flex-col overflow-hidden">
                <div
                  :class="cn(
                    'rounded-2xl px-4 py-2.5 text-sm min-w-0',
                    isUser(msg)
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted rounded-tl-sm',
                  )"
                >
                  <template v-if="isUser(msg)">
                    <p v-if="msg.content || msg.finalContent" class="whitespace-pre-wrap">
                      {{ msg.content || msg.finalContent }}
                    </p>
                  </template>

                  <template v-else>
                    <StreamMarkdownContent
                      v-if="msg.content || msg.finalContent"
                      :content="msg.content || msg.finalContent"
                      :is-streaming="streaming && index === lastAssistantIndex"
                    />
                    <div v-else class="flex items-center gap-1.5 py-1" aria-label="AI 正在输入">
                      <span class="sr-only">AI 正在输入</span>
                      <span class="size-1.5 rounded-full bg-current animate-bounce" style="animation-delay: 0ms" />
                      <span class="size-1.5 rounded-full bg-current animate-bounce" style="animation-delay: 150ms" />
                      <span class="size-1.5 rounded-full bg-current animate-bounce" style="animation-delay: 300ms" />
                    </div>
                  </template>
                </div>

                <span
                  :class="cn(
                    'mt-1 text-xs text-muted-foreground',
                    isUser(msg) ? 'text-right' : 'text-left',
                  )"
                >
                  {{ formatTime(msg.createTime) }}
                </span>

                <div
                  v-if="!isUser(msg)"
                  class="mt-2 flex items-center gap-2"
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <Button
                          variant="ghost"
                          size="icon"
                          class="size-7"
                          @click="copyMessageContent(msg.content || msg.finalContent)"
                        >
                          <ClipboardIcon v-if="!copied" class="size-4" />
                          <ClipboardCheckIcon v-else class="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>复制</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </MessageScrollerItem>
          </MessageScrollerContent>
        </MessageScrollerViewport>

        <MessageScrollerButton>
          <ArrowDownIcon />
          <span class="sr-only">回到最新消息</span>
        </MessageScrollerButton>
      </MessageScroller>
    </MessageScrollerProvider>
  </div>
</template>
