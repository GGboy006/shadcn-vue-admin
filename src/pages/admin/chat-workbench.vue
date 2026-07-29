<script setup lang="ts">
import {
  ArrowLeftIcon,
  Loader2Icon,
  MessageSquareIcon,
  MoreVerticalIcon,
  SendIcon,
} from '@lucide/vue'
import { useInfiniteQuery, useQueryClient } from '@tanstack/vue-query'
import { useEventListener } from '@vueuse/core'
import dayjs from 'dayjs'
import { toast } from 'vue-sonner'

import type { IChatMessage, IConversation, IConversationDetail, IConversationListQuery } from '@/services/api/conversation.api'
import type { IResponse } from '@/services/types/response.type'

import ChatMessageList from '@/components/chat/ChatMessageList.vue'
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
  convertStreamMessagesToChatMessages,
  serviceModeConfig,
  useGetConversationDetailQuery,
  userTagConfig,
} from '@/services/api/conversation.api'
import { useGetMessageListQuery } from '@/services/api/skill.api'
import { useStationRegenerateStore } from '@/stores/station-regenerate'
import { withBase } from '@/utils/with-base'

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

const listScrollRef = ref<InstanceType<typeof ScrollArea>>()

// 监听 ScrollArea viewport 滚动事件（Reka UI ScrollAreaRoot 不会自动转发 scroll 事件）
let stopScrollListener: (() => void) | undefined
watch(listScrollRef, (ref) => {
  stopScrollListener?.()
  if (!ref)
    return
  const viewport = ref.$el?.querySelector('[data-radix-scroll-area-viewport]')
  if (!viewport)
    return
  stopScrollListener = useEventListener(viewport, 'scroll', onListScroll)
})

// 列表滚动触底加载
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

// 当前选中的会话（用于获取 type 等元信息）
const selectedConversation = computed(() => {
  return conversationList.value.find(c => String(c.chatId) === selectedChatId.value)
})

// Coze/Agent 类型会话（type 1/2）使用 /aiCommon/messageList 获取消息
const isStreamType = computed(() => {
  const type = selectedConversation.value?.type
  return type === 1 || type === 2
})

// 原有详情查询（非 1/2 类型时启用）
const { data: detailData, isLoading: isDetailLoading } = useGetConversationDetailQuery(
  chatIdRef,
  computed(() => !isStreamType.value),
)

// 消息列表查询（1/2 类型时启用）
const messageListQuery = computed(() => {
  if (!selectedChatId.value || !isStreamType.value)
    return null
  return {
    chatId: selectedChatId.value,
    pageNum: 1,
    pageSize: 100,
    searchCount: false,
  }
})

const { data: messageListData, isLoading: isMessageListLoading } = useGetMessageListQuery(messageListQuery)

// 会话元信息：优先从详情接口获取，否则从会话列表获取
const conversation = computed(() => detailData.value?.data ?? selectedConversation.value)

// 统一消息列表
const messages = computed<IChatMessage[]>(() => {
  if (isStreamType.value) {
    const list = messageListData.value?.data?.list ?? []
    return convertStreamMessagesToChatMessages(list)
  }
  return (conversation.value as IConversationDetail | undefined)?.messages ?? []
})

// 统一的详情加载状态
const isLoadingDetail = computed(() => {
  return isStreamType.value ? isMessageListLoading.value : isDetailLoading.value
})

// type 1/2 为流式会话，工作台仅查看，禁止手动输入
const isInputDisabled = computed(() => isStreamType.value)

const inputText = ref('')
const isSending = ref(false)
const queryClient = useQueryClient()

async function handleSend() {
  if (!inputText.value.trim() || !selectedChatId.value || isInputDisabled.value)
    return

  isSending.value = true

  try {
    await apiFetch('/aiCommon/sendManualTakeoverMessage', {
      method: 'post',
      params: {
        chatId: selectedChatId.value,
        content: inputText.value,
      },
    })

    inputText.value = ''
    // 刷新消息列表以显示新消息
    // flex-col-reverse 模式下新消息自动出现在底部，无需手动滚动
    if (isStreamType.value) {
      queryClient.invalidateQueries({ queryKey: ['messageList'] })
    }
    else {
      queryClient.invalidateQueries({ queryKey: ['conversationDetail', selectedChatId.value] })
    }
  }
  catch (error) {
    console.error('发送消息失败:', error)
    toast.error('发送失败')
  }
  finally {
    isSending.value = false
  }
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

// flex-col-reverse 模式下，新消息自然排列在底部，无需手动滚动控制
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
        class="flex-1 min-h-0"
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
                  <AvatarImage :src="withBase('/robot.png')" />
                  <AvatarFallback>{{ getInitials(userTagConfig[item.userTag] || '用户') }}</AvatarFallback>
                </Avatar>
                <!-- 服务模式角标 -->
                <div
                  :class="cn(
                    'absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-background',
                    item.serviceMode === 0 && 'bg-primary',
                    item.serviceMode === 1 && 'bg-chart-2',
                    item.serviceMode === 2 && 'bg-destructive',
                    item.serviceMode === 9 && 'bg-chart-4',
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
                <AvatarImage :src="withBase('/robot.png')" alt="AI" />
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

            <template v-else-if="isLoadingDetail">
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
        <ChatMessageList
          :messages="messages"
          user-position="left"
          :show-steps="true"
          :show-regenerate="true"
          empty-text="该会话暂无消息"
          @regenerate="handleRegenerate"
        />

        <!-- 输入框 -->
        <div class="border-t bg-background p-3 sm:p-4 shrink-0">
          <div
            :class="cn(
              'flex items-end gap-2 rounded-lg border border-input bg-card px-3 py-2',
              !isInputDisabled && 'focus-within:ring-1 focus-within:ring-ring',
            )"
          >
            <textarea
              v-model="inputText"
              :placeholder="isInputDisabled ? '该会话为AI流式会话，仅可查看' : '输入消息...'"
              rows="1"
              :disabled="isInputDisabled"
              :class="cn(
                'min-h-[36px] max-h-[120px] flex-1 resize-none bg-transparent py-2 text-sm outline-none',
                isInputDisabled && 'cursor-not-allowed opacity-60',
              )"
              @keydown="handleKeydown"
            />

            <Button
              variant="default"
              size="icon"
              class="size-8 rounded-full shrink-0"
              :disabled="isInputDisabled || !inputText.trim()"
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
  roles: [3]
  layout: fixed
</route>
