<script setup lang="ts">
import { ArrowLeftIcon, MoreVerticalIcon, SendIcon } from '@lucide/vue'
import { useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'

import type { IChatMessage } from '@/services/api/conversation.api'

import ChatMessageList from '@/components/chat/ChatMessageList.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiFetch } from '@/composables/use-fetch'
import { useGetConversationDetailQuery } from '@/services/api/conversation.api'
import { withBase } from '@/utils/with-base'

const route = useRoute<'/conversations/[chatId]'>()
const router = useRouter()
const chatId = computed(() => String(route.params.chatId))

const { apiFetch } = useApiFetch()
const queryClient = useQueryClient()

// 获取会话详情（包含消息历史）
const { data: detailData, isLoading: _isLoadingDetail } = useGetConversationDetailQuery(chatId)

// 会话信息
const conversation = computed(() => detailData.value?.data)

// 消息列表
const messages = computed<IChatMessage[]>(() => {
  return conversation.value?.messages ?? []
})

// 返回列表
function goBack() {
  router.push('/conversations')
}

// 输入框
const inputText = ref('')
const isSending = ref(false)

async function handleSend() {
  if (!inputText.value.trim() || !chatId.value)
    return

  isSending.value = true

  try {
    await apiFetch('/aiCommon/sendManualTakeoverMessage', {
      method: 'post',
      params: {
        chatId: chatId.value,
        content: inputText.value,
      },
    })

    inputText.value = ''
    // 刷新会话详情以显示新消息
    queryClient.invalidateQueries({ queryKey: ['conversationDetail', chatId.value] })
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
    <ChatMessageList
      show-steps
      :messages="messages"
      user-position="right"
      empty-text="发送消息开始与AI助手对话"
    />

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
          :disabled="!inputText.trim() || isSending"
          :loading="isSending"
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
