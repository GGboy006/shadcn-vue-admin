<script setup lang="ts">
import { ArrowLeftIcon, DownloadIcon, Loader2Icon, MessageSquareIcon, MoreVerticalIcon, SendIcon } from '@lucide/vue'
import dayjs from 'dayjs'

import type { IChatMessage } from '@/services/api/conversation.api'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useGetConversationDetailQuery, useGetImageGenerationQuery } from '@/services/api/conversation.api'

const route = useRoute<'/conversations/[chatId]'>()
const router = useRouter()
const chatId = computed(() => String(route.params.chatId))

// 获取会话详情（包含消息历史）
const { data: detailData, isLoading: _isLoadingDetail } = useGetConversationDetailQuery(chatId)

// 会话信息
const conversation = computed(() => detailData.value?.data)

// 消息列表
const messages = computed<IChatMessage[]>(() => {
  return conversation.value?.messages ?? []
})

// 按日期分组消息
const groupedMessages = computed(() => {
  const groups: Record<string, IChatMessage[]> = {}
  messages.value.forEach((msg) => {
    const date = dayjs(msg.createTime).format('YYYY年MM月DD日')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(msg)
  })
  return groups
})

// 输入框
const inputText = ref('')

function handleSend() {
  if (!inputText.value.trim())
    return

  // TODO: 调用发送消息接口
  inputText.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

// 获取头像首字母
function getInitials(name: string) {
  if (!name)
    return '?'
  return name.slice(0, 2).toUpperCase()
}

// 返回列表
function goBack() {
  router.push('/conversations')
}

// 图片生成结果缓存：key=imageGenerationId, value=query result
const imageGenerationMap = new Map<number, ReturnType<typeof useGetImageGenerationQuery>>()

/** 获取或创建图片生成查询 */
function getImageGenerationQuery(imageGenerationId: number | undefined) {
  if (!imageGenerationId || imageGenerationId <= 0)
    return null
  if (!imageGenerationMap.has(imageGenerationId)) {
    const idRef = ref(imageGenerationId)
    const query = useGetImageGenerationQuery(idRef)
    imageGenerationMap.set(imageGenerationId, query)
  }
  return imageGenerationMap.get(imageGenerationId)!
}

/** 解析 size 字符串为比例数字，如 "1024x1024" -> 1, "1024x768" -> 1.33 */
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

/** 获取图片生成状态 */
function getImageStatus(imageGenerationId: number | undefined): {
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

// 下载图片
function downloadImage(url: string, msgId: string) {
  if (!url)
    return
  const link = document.createElement('a')
  link.href = url
  link.download = `image-${msgId}.png`
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 滚动到底部
const scrollAreaRef = ref<InstanceType<typeof ScrollArea>>()
watch(() => messages.value.length, () => {
  nextTick(() => {
    const viewport = scrollAreaRef.value?.$el?.querySelector('[data-radix-scroll-area-viewport]')
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight
    }
  })
})
</script>

<template>
  <div class="relative -m-4">
    <!-- 顶部信息栏 -->
    <div class="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3">
      <div class="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8"
          @click="goBack"
        >
          <ArrowLeftIcon class="size-4" />
        </Button>

        <template v-if="conversation">
          <Avatar class="size-9">
            <AvatarImage src="/robot.png" alt="AI" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium">{{ conversation.title || '未命名会话' }}</span>
              <Badge
                :variant="conversation.serviceMode === 0 ? 'default' : 'secondary'"
                class="text-xs"
              >
                {{ conversation.serviceMode === 0 ? 'AI托管' : '人工接管' }}
              </Badge>
            </div>
            <span class="text-xs text-muted-foreground">
              {{ conversation.lastMessagePreview || '暂无消息' }}
            </span>
          </div>
        </template>

        <template v-else-if="_isLoadingDetail">
          <Skeleton class="size-9 rounded-full" />
          <div class="space-y-1">
            <Skeleton class="h-4 w-24" />
            <Skeleton class="h-3 w-16" />
          </div>
        </template>
      </div>

      <div class="flex items-center gap-1">
        <Button variant="ghost" size="icon" class="size-8">
          <MoreVerticalIcon class="size-4 text-muted-foreground" />
        </Button>
      </div>
    </div>

    <!-- 消息区域 -->
    <ScrollArea ref="scrollAreaRef" class="px-4">
      <div class="flex flex-col gap-4 py-4">
        <template v-if="messages.length === 0">
          <div class="flex h-full flex-col items-center justify-center space-y-4 py-20">
            <div class="flex size-16 items-center justify-center rounded-full border-2 border-border">
              <MessageSquareIcon class="size-8" />
            </div>
            <div class="space-y-2 text-center">
              <h1 class="text-xl font-semibold">
                开始对话
              </h1>
              <p class="text-sm text-muted-foreground">
                发送消息开始与AI助手对话
              </p>
            </div>
          </div>
        </template>

        <template v-else>
          <div
            v-for="(group, date) in groupedMessages"
            :key="date"
            class="flex flex-col gap-3"
          >
            <!-- 日期分隔 -->
            <div class="text-center text-xs text-muted-foreground py-2">
              {{ date }}
            </div>

            <!-- 消息列表 -->
            <div
              v-for="msg in group"
              :key="msg.id"
              :class="cn(
                'flex w-fit max-w-[80%] gap-2',
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto',
              )"
            >
              <!-- 头像 -->
              <Avatar v-if="msg.role === 'assistant'" class="mt-1 size-8 shrink-0">
                <AvatarImage src="/robot.png" alt="AI" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <Avatar v-else class="mt-1 size-8 shrink-0">
                <AvatarFallback>{{ getInitials('用户') }}</AvatarFallback>
              </Avatar>

              <!-- 消息内容 -->
              <div class="flex flex-col">
                <div
                  :class="cn(
                    'rounded-2xl px-4 py-2.5 text-sm',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted rounded-tl-sm',
                  )"
                >
                  <!-- 文本内容 -->
                  <p>{{ msg.content || msg.finalContent }}</p>

                  <!-- 图片生成消息：通过 imageGenerationId 查询图片URL -->
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
                      <div class="max-w-[320px]">
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
                      <Button
                        variant="outline"
                        size="sm"
                        class="w-full max-w-[320px]"
                        @click="downloadImage(getImageStatus(msg.imageGenerationId).imageUrl || '', msg.id)"
                      >
                        <DownloadIcon class="size-4 mr-1" />
                        下载图片
                      </Button>
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

                <!-- 时间 -->
                <span
                  :class="cn(
                    'mt-1 text-xs text-muted-foreground',
                    msg.role === 'user' ? 'text-right' : 'text-left',
                  )"
                >
                  {{ dayjs(msg.createTime).format('HH:mm') }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </ScrollArea>

    <!-- 输入框 -->
    <div class="sticky bottom-0 z-10 border-t bg-background p-4">
      <div class="flex items-end gap-2 rounded-lg border border-input bg-card px-3 py-2 focus-within:ring-1 focus-within:ring-ring">
        <!-- 附件按钮展示没有开发 -->
        <!-- <div class="flex items-center gap-1 pb-1">
          <Button variant="ghost" size="icon" class="size-8 rounded-md">
            <PaperclipIcon class="size-4 text-muted-foreground" />
          </Button>
        </div> -->

        <textarea
          v-model="inputText"
          placeholder="输入消息..."
          rows="1"
          class="min-h-[36px] max-h-[120px] flex-1 resize-none bg-transparent py-2 text-sm outline-none"
          @keydown="handleKeydown"
        />

        <Button
          variant="default"
          size="icon"
          class="size-8 rounded-full shrink-0"
          :disabled="!inputText.trim()"
          @click="handleSend"
        >
          <SendIcon class="size-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  auth: true
</route>
