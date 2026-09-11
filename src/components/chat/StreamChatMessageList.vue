<script setup lang="ts">
import { ClipboardCheckIcon, ClipboardIcon, MessageSquareIcon } from '@lucide/vue'
import { useClipboard } from '@vueuse/core'
import dayjs from 'dayjs'
import { computed, useSlots } from 'vue'

import type { IChatMessage } from '@/services/api/conversation.api'

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import {
  Message,
  MessageAction,
  MessageActions,
  MessageAvatar,
  MessageContent,
  MessageToolbar,
} from '@/components/ai-elements/message'
import { cn } from '@/lib/utils'
import { getMessageText, hasAssistantVisualContent, toMessageAlign, toMessageUiFrom, visibleChatMessages } from '@/utils/chat-message-parts'
import { hasFlyCards, mapFlyCardsByMessageId } from '@/utils/feizhu'
import { withBase } from '@/utils/with-base'

import AssistantMessageBody from './assistant-message-body.vue'

interface Props {
  messages: IChatMessage[]
  emptyText?: string
  streaming?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  emptyText: '暂无消息',
  streaming: false,
})

const slots = useSlots()
const hasHeaderSlot = computed(() => !!slots.header)
const displayMessages = computed(() => visibleChatMessages(props.messages))
const flyCardsByMessageId = computed(() => mapFlyCardsByMessageId(props.messages))
const isEmpty = computed(() => displayMessages.value.length === 0 && !hasHeaderSlot.value)
const { copy, copied } = useClipboard()

const lastAssistantIndex = computed(() => {
  let lastIndex = -1
  for (let i = 0; i < displayMessages.value.length; i++) {
    if (!isUser(displayMessages.value[i]))
      lastIndex = i
  }
  return lastIndex
})

function copyMessageContent(msg: IChatMessage) {
  const content = getMessageText(msg)
  if (!content)
    return
  copy(content)
}

function isUser(msg: IChatMessage) {
  return msg.role === 'user'
}

function formatTime(time: string) {
  return dayjs(time).format('HH:mm')
}

function avatarSrc(msg: IChatMessage) {
  return isUser(msg) ? undefined : withBase('/robot.png')
}
</script>

<template>
  <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
    <ConversationEmptyState
      v-if="isEmpty"
      title="开始对话"
      :description="emptyText"
    >
      <template #icon>
        <MessageSquareIcon class="size-8" />
      </template>
    </ConversationEmptyState>

    <Conversation v-else>
      <ConversationContent
        :aria-busy="streaming"
        class="gap-4 py-4"
      >
        <div v-if="hasHeaderSlot" class="shrink-0">
          <slot name="header" />
        </div>

        <Message
          v-for="(msg, index) in displayMessages"
          :key="msg.id"
          :from="toMessageUiFrom(msg.role)"
          :align="toMessageAlign(msg.role, 'right')"
        >
          <MessageAvatar
            :src="avatarSrc(msg)"
            :name="isUser(msg) ? '用户' : 'AI'"
          />
          <div class="flex min-w-0 flex-col overflow-hidden">
            <MessageContent :class="!isUser(msg) && hasFlyCards(flyCardsByMessageId.get(msg.id)) ? 'w-full' : undefined">
              <template v-if="isUser(msg)">
                <p v-if="getMessageText(msg)" class="whitespace-pre-wrap">
                  {{ getMessageText(msg) }}
                </p>
              </template>
              <template v-else>
                <AssistantMessageBody
                  :message="msg"
                  :is-streaming="streaming && index === lastAssistantIndex"
                  :fly-cards="flyCardsByMessageId.get(msg.id)"
                />
                <div
                  v-if="!hasAssistantVisualContent(msg) && !hasFlyCards(flyCardsByMessageId.get(msg.id))"
                  class="flex items-center gap-1.5 py-1"
                  aria-label="AI 正在输入"
                >
                  <span class="sr-only">AI 正在输入</span>
                  <span class="size-1.5 animate-bounce rounded-full bg-current" style="animation-delay: 0ms" />
                  <span class="size-1.5 animate-bounce rounded-full bg-current" style="animation-delay: 150ms" />
                  <span class="size-1.5 animate-bounce rounded-full bg-current" style="animation-delay: 300ms" />
                </div>
              </template>
            </MessageContent>

            <span
              :class="cn(
                'mt-1 text-xs text-muted-foreground',
                isUser(msg) ? 'text-right' : 'text-left',
              )"
            >
              {{ formatTime(msg.createTime) }}
            </span>

            <MessageToolbar v-if="!isUser(msg)" class="justify-start">
              <MessageActions>
                <MessageAction tooltip="复制" @click="copyMessageContent(msg)">
                  <ClipboardIcon v-if="!copied" class="size-4" />
                  <ClipboardCheckIcon v-else class="size-4" />
                </MessageAction>
              </MessageActions>
            </MessageToolbar>
          </div>
        </Message>
      </ConversationContent>
      <template #overlay>
        <ConversationScrollButton />
      </template>
    </Conversation>
  </div>
</template>
