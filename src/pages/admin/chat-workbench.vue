<script setup lang="ts">
import {
  ArrowLeftIcon,
  DownloadIcon,
  Loader2Icon,
  MessageSquareIcon,
  MoreVerticalIcon,
  SendIcon,
  SparklesIcon,
} from '@lucide/vue'
import { useInfiniteQuery } from '@tanstack/vue-query'
import dayjs from 'dayjs'

import type { IChatMessage, IConversation, IConversationListQuery } from '@/services/api/conversation.api'
import type { IResponse } from '@/services/types/response.type'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DigitalClock } from '@/components/ui/clock'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useApiFetch } from '@/composables/use-fetch'
import { cn } from '@/lib/utils'
import {
  serviceModeConfig,
  useGetConversationDetailQuery,
  useGetImageGenerationQuery,
  userTagConfig,
} from '@/services/api/conversation.api'
import { useStationRegenerateStore } from '@/stores/station-regenerate'

const router = useRouter()

// ==================== 左侧会话列表 ====================

const { apiFetch } = useApiFetch()

/** 站长视角会话列表查询 */
function useGetAdminConversationListQuery(status: Ref<string>) {
  return useInfiniteQuery({
    queryKey: ['adminConversationList', status],
    queryFn: async ({ pageParam = 1 }) => {
      const query: IConversationListQuery = {
        pageNum: pageParam,
        pageSize: 20,
        status: status.value === 'all' ? undefined : status.value,
      }
      return await apiFetch<IResponse<{ list: IConversation[], total: number }>>('/aiCommon/conversationList', {
        method: 'get',
        query,
      })
    },
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length
      const total = lastPage.data?.total ?? 0
      const pageSize = 20
      const totalPages = Math.ceil(total / pageSize)
      return currentPage < totalPages ? currentPage + 1 : undefined
    },
    initialPageParam: 1,
  })
}

const listStatus = ref('1')

const {
  data: listData,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading: isListLoading,
} = useGetAdminConversationListQuery(listStatus)

const conversationList = computed<IConversation[]>(() => {
  return listData.value?.pages.flatMap(page => page.data?.list ?? []) ?? []
})

// 选中的会话（桌面端始终控制右侧详情内容）
const selectedChatId = ref<string>('')

// 移动端选中状态（控制详情页是否覆盖显示）
const mobileSelectedChatId = ref<string>('')

// 默认选中第一个
watch(conversationList, (list) => {
  if (list.length > 0 && !selectedChatId.value) {
    selectedChatId.value = String(list[0].chatId)
  }
}, { immediate: true })

function handleSelectConversation(chatId: string) {
  selectedChatId.value = chatId
  mobileSelectedChatId.value = chatId
}

function handleBackToList() {
  mobileSelectedChatId.value = ''
}

// 列表滚动触底加载
const listScrollRef = ref<InstanceType<typeof ScrollArea>>()
function onListScroll() {
  const viewport = listScrollRef.value?.$el?.querySelector('[data-radix-scroll-area-viewport]')
  if (!viewport)
    return
  const { scrollTop, scrollHeight, clientHeight } = viewport
  if (scrollTop + clientHeight >= scrollHeight - 20 && hasNextPage.value && !isFetchingNextPage.value) {
    fetchNextPage()
  }
}

function formatListTime(dateStr: string | undefined) {
  if (!dateStr)
    return ''
  const d = dayjs(dateStr)
  const now = dayjs()
  if (d.isSame(now, 'day'))
    return d.format('HH:mm')
  if (d.isSame(now.subtract(1, 'day'), 'day'))
    return '昨天'
  if (d.isAfter(now.subtract(7, 'day')))
    return d.format('ddd')
  return d.format('MM-DD')
}

// ==================== 右侧对话详情 ====================

const chatIdRef = computed(() => selectedChatId.value)

const { data: detailData, isLoading: isDetailLoading } = useGetConversationDetailQuery(chatIdRef)

const conversation = computed(() => detailData.value?.data)

const messages = computed<IChatMessage[]>(() => {
  return conversation.value?.messages ?? []
})

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

const inputText = ref('')

function handleSend() {
  if (!inputText.value.trim())
    return
  // TODO: 站长发送消息接口
  inputText.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function handleRegenerate(msg: IChatMessage) {
  // 从当前会话详情获取 skillId
  const skillId = conversation.value?.skillId
  const chatId = msg.chatId
  const steps = msg.steps
  const merchantCode = conversation.value?.orgCode

  if (!skillId || !chatId || !steps || steps.length === 0) {
    return
  }

  // 将数据存入 store，避免 URL 过长
  const stationStore = useStationRegenerateStore()
  stationStore.setRegenerateData({ chatId, merchantCode: merchantCode || '', steps })

  // 跳转到技能页面，仅携带模式标记
  router.push({
    path: `/apps/${skillId}`,
    query: {
      mode: 'station_regenerate',
    },
  })
}

function getInitials(name: string) {
  if (!name)
    return '?'
  return name.slice(0, 2).toUpperCase()
}

// 图片生成结果缓存
const imageGenerationMap = new Map<number, ReturnType<typeof useGetImageGenerationQuery>>()

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
  <div class="relative flex h-full -m-4 overflow-hidden">
    <!-- 左侧会话列表 -->
    <div
      :class="cn(
        'absolute inset-0 z-10 flex flex-col border-r bg-card h-full w-full',
        'sm:static sm:w-80 sm:shrink-0',
        mobileSelectedChatId && 'hidden sm:flex',
      )"
    >
      <!-- 时钟 -->
      <div class="p-3 pb-0 flex justify-center">
        <DigitalClock format="HH:mm:ss" :show-period="true" />
      </div>

      <!-- 头部 Tabs -->
      <div class="p-3 border-b">
        <Tabs v-model="listStatus" class="w-full">
          <TabsList class="grid w-full grid-cols-3">
            <TabsTrigger value="1">
              待介入
            </TabsTrigger>
            <TabsTrigger value="all">
              全部
            </TabsTrigger>
            <TabsTrigger value="2">
              已完成
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <!-- 会话列表 -->
      <ScrollArea
        ref="listScrollRef"
        class="flex-1"
        @scroll="onListScroll"
      >
        <div class="flex flex-col">
          <!-- 加载中 -->
          <template v-if="isListLoading">
            <div
              v-for="i in 5"
              :key="i"
              class="flex items-start gap-3 p-3"
            >
              <Skeleton class="size-10 rounded-full" />
              <div class="flex-1 space-y-2">
                <Skeleton class="h-4 w-24" />
                <Skeleton class="h-3 w-full" />
              </div>
            </div>
          </template>

          <!-- 空状态 -->
          <template v-else-if="conversationList.length === 0">
            <div class="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MessageSquareIcon class="size-8 mb-2 opacity-50" />
              <p class="text-sm">
                暂无会话
              </p>
            </div>
          </template>

          <!-- 列表项 -->
          <template v-else>
            <div
              v-for="item in conversationList"
              :key="item.chatId"
              :class="cn(
                'flex items-start gap-3 p-3 cursor-pointer hover:bg-accent/50 transition-colors',
                selectedChatId === String(item.chatId) && 'bg-accent',
              )"
              @click="handleSelectConversation(String(item.chatId))"
            >
              <!-- 头像 -->
              <div class="relative shrink-0">
                <Avatar class="size-10">
                  <AvatarImage src="/robot.png" />
                  <AvatarFallback>{{ getInitials(userTagConfig[item.userTag] || '用户') }}</AvatarFallback>
                </Avatar>
                <!-- 服务模式角标 -->
                <div
                  :class="cn(
                    'absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-background',
                    item.serviceMode === 0 && 'bg-primary',
                    item.serviceMode === 1 && 'bg-chart-2',
                    item.serviceMode === 2 && 'bg-destructive',
                  )"
                  :title="serviceModeConfig[item.serviceMode]?.label"
                />
              </div>

              <!-- 内容 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm font-medium truncate">
                    {{ item.title || '未命名会话' }}
                  </span>
                  <span class="text-xs text-muted-foreground shrink-0">
                    {{ formatListTime(item.lastMessageTime) }}
                  </span>
                </div>

                <div class="flex items-center gap-1.5 mt-0.5">
                  <Badge variant="outline" class="text-[10px] px-1 py-0 h-4">
                    {{ userTagConfig[item.userTag] || '未知' }}
                  </Badge>
                  <Badge
                    :variant="serviceModeConfig[item.serviceMode]?.variant || 'default'"
                    class="text-[10px] px-1 py-0 h-4"
                  >
                    {{ serviceModeConfig[item.serviceMode]?.label || '未知' }}
                  </Badge>
                </div>

                <p class="text-xs text-muted-foreground truncate mt-1">
                  {{ item.lastMessagePreview || '暂无消息' }}
                </p>

                <!-- 待处理消息数 -->
                <div v-if="item.pendingCount > 0" class="mt-1">
                  <Badge variant="destructive" class="text-[10px] px-1.5 py-0 h-4">
                    {{ item.pendingCount }} 条待处理
                  </Badge>
                </div>
              </div>
            </div>

            <!-- 加载更多 -->
            <div v-if="isFetchingNextPage" class="p-3 text-center">
              <Loader2Icon class="size-4 animate-spin mx-auto text-muted-foreground" />
            </div>
          </template>
        </div>
      </ScrollArea>
    </div>

    <!-- 右侧对话详情 -->
    <div
      :class="cn(
        'absolute inset-0 z-20 flex flex-col min-w-0 h-full overflow-hidden bg-background',
        'sm:static sm:flex-1',
        !mobileSelectedChatId && 'hidden sm:flex',
      )"
    >
      <!-- 未选中状态 -->
      <template v-if="!selectedChatId">
        <div class="flex flex-col items-center justify-center flex-1 text-muted-foreground">
          <MessageSquareIcon class="size-12 mb-4 opacity-30" />
          <p class="text-lg font-medium">
            选择一个会话
          </p>
          <p class="text-sm mt-1">
            从左侧列表选择一个会话查看详情
          </p>
        </div>
      </template>

      <!-- 有选中会话 -->
      <template v-else>
        <!-- 顶部信息栏 -->
        <div class="flex items-center justify-between border-b bg-background px-4 py-3 shrink-0">
          <div class="flex items-center gap-3">
            <!-- 移动端返回按钮 -->
            <Button
              variant="ghost"
              size="icon"
              class="sm:hidden -ml-2 size-8"
              @click="handleBackToList"
            >
              <ArrowLeftIcon class="size-5" />
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
                  <Badge variant="outline" class="text-xs">
                    {{ userTagConfig[conversation.userTag] || '未知' }}
                  </Badge>
                </div>
                <span class="text-xs text-muted-foreground">
                  {{ conversation.lastMessagePreview || '暂无消息' }}
                </span>
              </div>
            </template>

            <template v-else-if="isDetailLoading">
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
        <ScrollArea ref="scrollAreaRef" class="flex-1 px-4 min-h-0">
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
                    该会话暂无消息
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
                    'flex w-fit max-w-[85%] sm:max-w-[75%] gap-2',
                    msg.role === 'user' ? 'mr-auto' : 'ml-auto flex-row-reverse',
                  )"
                >
                  <!-- 头像 -->
                  <Avatar v-if="msg.role === 'assistant'" class="mt-1 size-8 shrink-0">
                    <AvatarImage src="/robot.png" alt="AI" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <Avatar v-else-if="msg.role === 'station_merchant'" class="mt-1 size-8 shrink-0">
                    <AvatarFallback>{{ getInitials('站长') }}</AvatarFallback>
                  </Avatar>
                  <Avatar v-else class="mt-1 size-8 shrink-0">
                    <AvatarFallback>{{ getInitials('用户') }}</AvatarFallback>
                  </Avatar>

                  <!-- 消息内容 -->
                  <div class="flex flex-col min-w-0 overflow-hidden">
                    <div
                      :class="cn(
                        'rounded-2xl px-4 py-2.5 text-sm min-w-0',
                        msg.role === 'user'
                          ? 'bg-muted rounded-tl-sm'
                          : 'bg-primary text-primary-foreground rounded-tr-sm',
                      )"
                    >
                      <!-- 步骤配置卡片（优先渲染 steps） -->
                      <template v-if="msg.steps && msg.steps.length > 0 && !msg.imageGenerationId">
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
                      </template>

                      <!-- 普通文本内容 -->
                      <p v-else>
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
                          <div class="max-w-[200px] sm:max-w-[240px]">
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
                              variant="secondary"
                              size="sm"
                              class="flex-1 min-w-[120px]"
                              @click="handleRegenerate(msg)"
                            >
                              <SparklesIcon class="size-4 mr-1" />
                              基于此方案重新生成
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              class="flex-1 min-w-[120px]"
                              @click="downloadImage(getImageStatus(msg.imageGenerationId).imageUrl || '', msg.id)"
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

                    <!-- 时间 -->
                    <span
                      :class="cn(
                        'mt-1 text-xs text-muted-foreground',
                        msg.role === 'user' ? 'text-left' : 'text-right',
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
        <div class="border-t bg-background p-3 sm:p-4 shrink-0">
          <div class="flex items-end gap-2 rounded-lg border border-input bg-card px-3 py-2 focus-within:ring-1 focus-within:ring-ring">
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
      </template>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  auth: true
  roles: [3,4]
  title: '聊天工作台'
  layout: fixed
</route>
