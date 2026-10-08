<script setup lang="ts">
import { ClipboardCheckIcon, ClipboardIcon, DownloadIcon, Loader2Icon, MessageSquareIcon, SparklesIcon } from '@lucide/vue'
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
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useGetImageGenerationQuery } from '@/services/api/conversation.api'
import { getImageGenerationCards, getMessageText, hasAssistantVisualContent, toMessageAlign, toMessageUiFrom, visibleChatMessages } from '@/utils/chat-message-parts'
import { downloadImage } from '@/utils/download-image'
import { hasFlyCards, mapFlyCardsByMessageId } from '@/utils/feizhu'
import { withBase } from '@/utils/with-base'

import AssistantMessageBody from './assistant-message-body.vue'
import MessageAttachments from './message-attachments.vue'

interface Props {
  messages: IChatMessage[]
  /** 用户消息位置：left=站长端, right=商户端 */
  userPosition?: 'left' | 'right'
  /** 是否展示步骤配置卡片 */
  showSteps?: boolean
  /** 是否展示重新生成按钮 */
  showRegenerate?: boolean
  /** 空状态提示文案 */
  emptyText?: string
  /** 按天插入日期 */
  showDate?: boolean
  /** 最后一条助手消息处于流式输出 */
  streaming?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  userPosition: 'left',
  showSteps: false,
  showRegenerate: false,
  emptyText: '暂无消息',
  showDate: false,
  streaming: false,
})

const emit = defineEmits<{
  regenerate: [msg: IChatMessage]
}>()

const slots = useSlots()
const hasHeaderSlot = computed(() => !!slots.header)
const displayMessages = computed(() => visibleChatMessages(props.messages))
const flyCardsByMessageId = computed(() => mapFlyCardsByMessageId(props.messages))
const isEmpty = computed(() => displayMessages.value.length === 0 && !hasHeaderSlot.value)
const { copy, copied } = useClipboard()

function messageTime(msg: IChatMessage) {
  const value = dayjs(msg.createTime).valueOf()
  return Number.isFinite(value) ? value : 0
}

const sortedMessages = computed(() =>
  [...displayMessages.value].sort((a, b) => messageTime(a) - messageTime(b)),
)

const messageGroups = computed(() => {
  const groups: { date: string, messages: IChatMessage[] }[] = []
  for (const msg of sortedMessages.value) {
    const date = dayjs(msg.createTime).format('YYYY年MM月DD日')
    const last = groups[groups.length - 1]
    if (!last || last.date !== date)
      groups.push({ date, messages: [msg] })
    else
      last.messages.push(msg)
  }
  return groups
})

const messageRows = computed(() => {
  if (!props.showDate)
    return [{ date: '', messages: sortedMessages.value }]
  return messageGroups.value
})

const lastStreamingId = computed(() => {
  if (!props.streaming)
    return ''
  const list = messageRows.value.flatMap(group => group.messages)
  for (let index = list.length - 1; index >= 0; index -= 1) {
    if (list[index]?.role === 'assistant')
      return list[index].id
  }
  return ''
})

function getInitials(name: string) {
  if (!name)
    return '?'
  return name.slice(0, 2).toUpperCase()
}

function avatarName(msg: IChatMessage) {
  if (msg.role === 'assistant')
    return 'AI'
  if (msg.role === 'station_master')
    return '站长'
  if (msg.role === 'station_merchant')
    return '商户'
  return '用户'
}

function avatarSrc(msg: IChatMessage) {
  return msg.role === 'assistant' ? withBase('/robot.png') : undefined
}

const imageGenerationMap = new Map<string, ReturnType<typeof useGetImageGenerationQuery>>()

function getImageGenerationQuery(imageGenerationId: string | undefined) {
  if (!imageGenerationId)
    return null
  if (!imageGenerationMap.has(imageGenerationId)) {
    const idRef = ref(imageGenerationId)
    const query = useGetImageGenerationQuery(idRef)
    imageGenerationMap.set(imageGenerationId, query)
  }
  return imageGenerationMap.get(imageGenerationId)!
}

function parseAspectRatio(size: string | undefined): number {
  if (!size)
    return 9 / 16
  const match = size.match(/(\d+)\s*[x:*×]\s*(\d+)/i)
  if (match) {
    const w = Number.parseInt(match[1], 10)
    const h = Number.parseInt(match[2], 10)
    if (h > 0)
      return w / h
  }
  return 9 / 16
}

function getImageStatus(imageGenerationId: string | undefined): {
  imageUrl: string | undefined
  status: 0 | 1 | 2 | undefined
  isLoading: boolean
  size: string | undefined
} {
  const query = getImageGenerationQuery(imageGenerationId)
  if (!query)
    return { imageUrl: undefined, status: undefined, isLoading: false, size: undefined }
  return {
    imageUrl: query.data.value?.data?.imageUrl,
    status: query.data.value?.data?.status,
    isLoading: query.isLoading.value,
    size: query.data.value?.data?.size,
  }
}

function handleDownloadImage(url: string, msgId: string) {
  downloadImage(url, `image-${msgId}`)
}

function copyMessageContent(msg: IChatMessage) {
  const content = getMessageText(msg)
  if (!content)
    return
  copy(content)
}

function isAssistant(msg: IChatMessage) {
  return msg.role === 'assistant'
}

function getTimeAlignClass(msg: IChatMessage) {
  return toMessageAlign(msg.role, props.userPosition) === 'end' ? 'text-right' : 'text-left'
}

function isLeftSide(msg: IChatMessage) {
  return toMessageAlign(msg.role, props.userPosition) === 'start'
}

function showBubble(msg: IChatMessage) {
  return (hasAssistantVisualContent(msg) || msg.imageGenerationId || !!msg.attachments?.length || msg.role === 'assistant')
    && !(msg.role === 'user' && msg.steps && msg.steps.length > 0)
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

        <template v-for="group in messageRows" :key="group.date || 'messages'">
          <div v-if="showDate && group.date" class="shrink-0 py-2 text-center text-xs text-muted-foreground">
            {{ group.date }}
          </div>
          <Message
            v-for="msg in group.messages"
            :key="msg.id"
            :from="toMessageUiFrom(msg.role)"
            :align="toMessageAlign(msg.role, userPosition)"
          >
            <MessageAvatar
              :src="avatarSrc(msg)"
              :name="getInitials(avatarName(msg))"
            />
            <div class="flex min-w-0 flex-col overflow-hidden">
              <MessageContent
                v-if="showBubble(msg)"
                :class="hasFlyCards(flyCardsByMessageId.get(msg.id)) ? 'w-full' : undefined"
              >
                <template v-if="isAssistant(msg)">
                  <AssistantMessageBody
                    :message="msg"
                    :is-streaming="msg.id === lastStreamingId"
                    :fly-cards="flyCardsByMessageId.get(msg.id)"
                  />
                  <div
                    v-if="!hasAssistantVisualContent(msg) && !hasFlyCards(flyCardsByMessageId.get(msg.id)) && msg.id !== lastStreamingId"
                    class="flex items-center gap-1.5 py-1"
                    aria-label="AI 正在输入"
                  >
                    <span class="sr-only">AI 正在输入</span>
                    <span class="size-1.5 animate-bounce rounded-full bg-current" style="animation-delay: 0ms" />
                    <span class="size-1.5 animate-bounce rounded-full bg-current" style="animation-delay: 150ms" />
                    <span class="size-1.5 animate-bounce rounded-full bg-current" style="animation-delay: 300ms" />
                  </div>
                </template>
                <template v-else>
                  <p v-if="getMessageText(msg)" class="whitespace-pre-wrap">
                    {{ getMessageText(msg) }}
                  </p>
                  <MessageAttachments :attachments="msg.attachments" />
                </template>

                <div v-if="msg.imageGenerationId && !getImageGenerationCards(msg).length" class="mt-2 space-y-2">
                  <div
                    v-if="getImageStatus(msg.imageGenerationId).status === 0 || getImageStatus(msg.imageGenerationId).isLoading"
                    class="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <Loader2Icon class="size-4 animate-spin" />
                    <span>图片生成中...</span>
                  </div>

                  <template v-else-if="getImageStatus(msg.imageGenerationId).status === 1">
                    <div class="w-50">
                      <AspectRatio
                        :ratio="parseAspectRatio(getImageStatus(msg.imageGenerationId).size)"
                        class="overflow-hidden rounded-lg bg-muted"
                      >
                        <img
                          :src="getImageStatus(msg.imageGenerationId).imageUrl"
                          alt="生成的图片"
                          class="h-full w-full object-cover"
                          @error="($event.target as HTMLImageElement).style.display = 'none'"
                        >
                      </AspectRatio>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <Button
                        v-if="showRegenerate && msg.steps && msg.steps.length > 0"
                        variant="secondary"
                        size="sm"
                        class="min-w-[120px] flex-1"
                        @click="emit('regenerate', msg)"
                      >
                        <SparklesIcon class="mr-1 size-4" />
                        基于此方案重新生成
                      </Button>
                      <Button
                        :variant="isLeftSide(msg) ? 'default' : 'secondary'"
                        size="sm"
                        class="min-w-[120px] flex-1"
                        @click="handleDownloadImage(getImageStatus(msg.imageGenerationId).imageUrl || '', msg.id)"
                      >
                        <DownloadIcon class="mr-1 size-4" />
                        下载图片
                      </Button>
                    </div>
                  </template>

                  <div
                    v-else-if="getImageStatus(msg.imageGenerationId).status === 2"
                    class="text-xs text-destructive"
                  >
                    图片生成失败
                  </div>
                </div>
              </MessageContent>

              <div
                v-if="showSteps && msg.role === 'user' && msg.steps && msg.steps.length > 0"
                class="mt-2 rounded-lg bg-neutral-200 p-3 dark:bg-neutral-800"
              >
                <div class="grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2 sm:gap-x-6">
                  <div
                    v-for="step in msg.steps.filter(s => s.fieldValues.some(fv => fv.value !== undefined && fv.value !== '' && fv.value !== null))"
                    :key="step.stepCode"
                    class="space-y-2"
                  >
                    <div
                      v-for="fv in step.fieldValues.filter(f => f.value !== undefined && f.value !== '' && f.value !== null)"
                      :key="fv.field"
                      class="flex min-w-0 items-center gap-2 text-sm"
                    >
                      <span
                        v-if="fv.selectedOptions?.[0]?.icon"
                        class="shrink-0 text-base"
                      >
                        {{ fv.selectedOptions[0].icon }}
                      </span>
                      <span
                        v-else
                        class="flex size-4 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-xs text-primary"
                      >
                        ✓
                      </span>
                      <span class="truncate text-muted-foreground">{{ fv.label }}</span>
                      <span class="truncate font-medium">{{ fv.selectedOptions?.[0]?.label || fv.value }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <span
                :class="cn(
                  'mt-1 text-xs text-muted-foreground',
                  getTimeAlignClass(msg),
                )"
              >
                {{ dayjs(msg.createTime).format('HH:mm') }}
              </span>

              <MessageToolbar
                v-if="isAssistant(msg) && getMessageText(msg)"
                :class="getTimeAlignClass(msg) === 'text-right' ? 'justify-end' : 'justify-start'"
              >
                <MessageActions>
                  <MessageAction tooltip="复制" @click="copyMessageContent(msg)">
                    <ClipboardIcon v-if="!copied" class="size-4" />
                    <ClipboardCheckIcon v-else class="size-4" />
                  </MessageAction>
                </MessageActions>
              </MessageToolbar>
            </div>
          </Message>
        </template>
      </ConversationContent>
      <template #overlay>
        <ConversationScrollButton />
      </template>
    </Conversation>
  </div>
</template>
