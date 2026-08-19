<script setup lang="ts">
import { ArrowDownIcon, ClipboardCheckIcon, ClipboardIcon, DownloadIcon, Loader2Icon, MessageSquareIcon, SparklesIcon } from '@lucide/vue'
import { useClipboard } from '@vueuse/core'
import dayjs from 'dayjs'
import { computed, useSlots } from 'vue'

import type { IChatMessage } from '@/services/api/conversation.api'

import { AspectRatio } from '@/components/ui/aspect-ratio'
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
import { useGetImageGenerationQuery } from '@/services/api/conversation.api'
import { downloadImage } from '@/utils/download-image'
import { withBase } from '@/utils/with-base'

import StreamMarkdownContent from './StreamMarkdownContent.vue'

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
}

const props = withDefaults(defineProps<Props>(), {
  userPosition: 'left',
  showSteps: false,
  showRegenerate: false,
  emptyText: '暂无消息',
})

const emit = defineEmits<{
  /** 点击重新生成 */
  regenerate: [msg: IChatMessage]
}>()

const slots = useSlots()
const hasHeaderSlot = computed(() => !!slots.header)
const isEmpty = computed(() => props.messages.length === 0 && !hasHeaderSlot.value)
const { copy, copied } = useClipboard()

/** 按时间正序分组，配合 MessageScroller 最旧在上、最新在下 */
const messageGroups = computed(() => {
  const sorted = [...props.messages].sort((a, b) =>
    dayjs(a.createTime).valueOf() - dayjs(b.createTime).valueOf(),
  )
  const groups: { date: string, messages: IChatMessage[] }[] = []
  for (const msg of sorted) {
    const date = dayjs(msg.createTime).format('YYYY年MM月DD日')
    const last = groups[groups.length - 1]
    if (!last || last.date !== date)
      groups.push({ date, messages: [msg] })
    else
      last.messages.push(msg)
  }
  return groups
})

// ==================== 头像首字母 ====================

function getInitials(name: string) {
  if (!name)
    return '?'
  return name.slice(0, 2).toUpperCase()
}

// ==================== 图片生成 ====================

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

function copyMessageContent(content: string) {
  if (!content)
    return
  copy(content)
}

function isAssistant(msg: IChatMessage) {
  return msg.role === 'assistant'
}

/** 判断是否为客户端（用户/商户）发送的消息 */
function isClientRole(msg: IChatMessage) {
  return msg.role === 'user' || msg.role === 'station_merchant'
}

function getWrapperClass(msg: IChatMessage) {
  const isClient = isClientRole(msg)
  if (props.userPosition === 'left') {
    // 站长端：客户端在左，assistant 在右
    return isClient ? 'mr-auto' : 'ml-auto flex-row-reverse'
  }
  else {
    // 商户端：客户端在右，assistant 在左
    return isClient ? 'ml-auto flex-row-reverse' : 'mr-auto'
  }
}

function getBubbleClass(msg: IChatMessage) {
  const isClient = isClientRole(msg)
  if (props.userPosition === 'left') {
    // 站长端：客户端=灰色，assistant=主色
    return isClient
      ? 'bg-muted rounded-tl-sm'
      : 'bg-primary text-primary-foreground rounded-tr-sm'
  }
  else {
    // 商户端：客户端=主色，assistant=灰色
    return isClient
      ? 'bg-primary text-primary-foreground rounded-tr-sm'
      : 'bg-muted rounded-tl-sm'
  }
}

function getTimeAlignClass(msg: IChatMessage) {
  const isClient = isClientRole(msg)
  if (props.userPosition === 'left') {
    return isClient ? 'text-left' : 'text-right'
  }
  else {
    return isClient ? 'text-right' : 'text-left'
  }
}

/** 判断消息是否在左侧 */
function isLeftSide(msg: IChatMessage) {
  const isClient = isClientRole(msg)
  if (props.userPosition === 'left') {
    return isClient
  }
  else {
    return !isClient
  }
}
</script>

<template>
  <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden px-4">
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
          <MessageScrollerContent class="gap-4 py-4 pe-4">
            <div v-if="hasHeaderSlot" class="shrink-0">
              <slot name="header" />
            </div>

            <template v-for="group in messageGroups" :key="group.date">
              <div class="shrink-0 py-2 text-center text-xs text-muted-foreground">
                {{ group.date }}
              </div>
              <MessageScrollerItem
                v-for="msg in group.messages"
                :key="msg.id"
                :message-id="msg.id"
                :scroll-anchor="isClientRole(msg)"
                :class="cn(
                  'flex w-fit max-w-[85%] sm:max-w-[75%] gap-2',
                  getWrapperClass(msg),
                )"
              >
                <!-- 头像 -->
                <Avatar v-if="msg.role === 'assistant'" class="mt-1 size-8 shrink-0">
                  <AvatarImage :src="withBase('/robot.png')" alt="AI" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <Avatar v-else-if="msg.role === 'station_master'" class="mt-1 size-8 shrink-0">
                  <AvatarFallback>{{ getInitials('站长') }}</AvatarFallback>
                </Avatar>
                <Avatar v-else-if="msg.role === 'station_merchant'" class="mt-1 size-8 shrink-0">
                  <AvatarFallback>{{ getInitials('商户') }}</AvatarFallback>
                </Avatar>
                <Avatar v-else class="mt-1 size-8 shrink-0">
                  <AvatarFallback>{{ getInitials('用户') }}</AvatarFallback>
                </Avatar>

                <!-- 消息内容 -->
                <div class="flex flex-col min-w-0 overflow-hidden">
                  <!-- 文本+图片消息气泡：有 steps 的 user 消息不渲染气泡，由步骤卡片替代 -->
                  <div
                    v-if="(msg.content || msg.finalContent || msg.imageGenerationId || msg.role === 'assistant') && !(msg.role === 'user' && msg.steps && msg.steps.length > 0)"
                    :class="cn(
                      'rounded-2xl px-4 py-2.5 text-sm min-w-0',
                      getBubbleClass(msg),
                    )"
                  >
                    <template v-if="isAssistant(msg)">
                      <StreamMarkdownContent
                        v-if="msg.content || msg.finalContent"
                        :content="msg.content || msg.finalContent"
                      />
                      <div v-else class="flex items-center gap-1.5 py-1" aria-label="AI 正在输入">
                        <span class="sr-only">AI 正在输入</span>
                        <span class="size-1.5 rounded-full bg-current animate-bounce" style="animation-delay: 0ms" />
                        <span class="size-1.5 rounded-full bg-current animate-bounce" style="animation-delay: 150ms" />
                        <span class="size-1.5 rounded-full bg-current animate-bounce" style="animation-delay: 300ms" />
                      </div>
                    </template>
                    <p v-else-if="msg.content || msg.finalContent" class="whitespace-pre-wrap">
                      {{ msg.content || msg.finalContent }}
                    </p>

                    <!-- 图片生成消息 -->
                    <div v-if="msg.imageGenerationId" class="mt-2 space-y-2">
                      <!-- 生成中状态 -->
                      <div
                        v-if="getImageStatus(msg.imageGenerationId).status === 0 || getImageStatus(msg.imageGenerationId).isLoading"
                        class="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <Loader2Icon class="size-4 animate-spin" />
                        <span>图片生成中...</span>
                      </div>

                      <!-- 生成成功：展示图片 -->
                      <template v-else-if="getImageStatus(msg.imageGenerationId).status === 1">
                        <div class="w-50">
                          <AspectRatio
                            :ratio="parseAspectRatio(getImageStatus(msg.imageGenerationId).size)"
                            class="bg-muted rounded-lg overflow-hidden"
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
                            class="flex-1 min-w-[120px]"
                            @click="emit('regenerate', msg)"
                          >
                            <SparklesIcon class="size-4 mr-1" />
                            基于此方案重新生成
                          </Button>
                          <Button
                            :variant="isLeftSide(msg) ? 'default' : 'secondary'"
                            size="sm"
                            class="flex-1 min-w-[120px]"
                            @click="handleDownloadImage(getImageStatus(msg.imageGenerationId).imageUrl || '', msg.id)"
                          >
                            <DownloadIcon class="size-4 mr-1" />
                            下载图片
                          </Button>
                        </div>
                      </template>

                      <!-- 生成失败 -->
                      <div
                        v-else-if="getImageStatus(msg.imageGenerationId).status === 2"
                        class="text-xs text-destructive"
                      >
                        图片生成失败
                      </div>
                    </div>
                  </div>

                  <!-- 步骤配置卡片：替换 user 角色的这一次消息，作为独立卡片展示 -->
                  <div
                    v-if="showSteps && msg.role === 'user' && msg.steps && msg.steps.length > 0"
                    class="mt-2 rounded-lg border bg-card/50 p-3 shadow-sm"
                  >
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-3 sm:gap-x-6 gap-y-3">
                      <div
                        v-for="step in msg.steps.filter(s => s.fieldValues.some(fv => fv.value !== undefined && fv.value !== '' && fv.value !== null))"
                        :key="step.stepCode"
                        class="space-y-2"
                      >
                        <div
                          v-for="fv in step.fieldValues.filter(f => f.value !== undefined && f.value !== '' && f.value !== null)"
                          :key="fv.field"
                          class="flex items-center gap-2 text-sm min-w-0"
                        >
                          <span
                            v-if="fv.selectedOptions?.[0]?.icon"
                            class="text-base shrink-0"
                          >
                            {{ fv.selectedOptions[0].icon }}
                          </span>
                          <span
                            v-else
                            class="size-4 rounded-sm bg-primary/10 shrink-0 flex items-center justify-center text-xs text-primary"
                          >
                            ✓
                          </span>
                          <span class="text-muted-foreground truncate">{{ fv.label }}</span>
                          <span class="font-medium truncate">{{ fv.selectedOptions?.[0]?.label || fv.value }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 时间 -->
                  <span
                    :class="cn(
                      'mt-1 text-xs text-muted-foreground',
                      getTimeAlignClass(msg),
                    )"
                  >
                    {{ dayjs(msg.createTime).format('HH:mm') }}
                  </span>

                  <div
                    v-if="isAssistant(msg) && (msg.content || msg.finalContent)"
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
            </template>
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
