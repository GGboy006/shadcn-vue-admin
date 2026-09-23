<script setup lang="ts">
import { ArrowLeftIcon, MoreVerticalIcon } from '@lucide/vue'
import { useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'

import type { IChatMessage } from '@/services/api/conversation.api'

import ChatPanel from '@/components/chat/ChatPanel.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiFetch } from '@/composables/use-fetch'
import { getConversationModeDisplay, useGetConversationDetailQuery } from '@/services/api/conversation.api'
import { hydrateChatMessage } from '@/utils/chat-message-parts'
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
  return (conversation.value?.messages ?? []).map(hydrateChatMessage)
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
</script>

<template>
  <div class="relative -m-4 flex h-full flex-col overflow-hidden">
    <!-- 顶部信息栏 -->
    <div class="flex shrink-0 items-center justify-between border-b bg-background px-4 py-3">
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
                :variant="getConversationModeDisplay(conversation.serviceMode, conversation.type).variant"
                class="text-xs"
              >
                {{ getConversationModeDisplay(conversation.serviceMode, conversation.type).label }}
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

    <ChatPanel
      v-model:input="inputText"
      show-steps
      show-date
      :messages="messages"
      user-position="right"
      :input-disabled="isSending"
      placeholder="输入消息..."
      empty-text="发送消息开始与AI助手对话"
      @submit="handleSend"
    />
  </div>
</template>

<route lang="yaml">
meta:
  auth: true
  layout: fixed
</route>
