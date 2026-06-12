<script setup lang="ts">
import { ArrowLeftIcon, Loader2Icon, SendIcon } from '@lucide/vue'

import type { AgentDetailResp, CityQuickCommand, CozeBotDetailResp } from '@/services/api/skill.api'

import StreamChatMessageList from '@/components/chat/StreamChatMessageList.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useGetAgentDetailQuery,
  useGetCozeDetailQuery,
} from '@/services/api/skill.api'

import AgentPromptTemplateForm from './components/AgentPromptTemplateForm.vue'
import AgentVisionDrawer from './components/AgentVisionDrawer.vue'
import { useChatStream } from './composables/use-chat-stream'

const route = useRoute()
const router = useRouter()

const skillId = computed(() => (route.query.skillId as string) || '')
const thirdId = computed(() => (route.query.thirdId as string) || '')
const skillType = computed(() => Number(route.query.type) as 1 | 2)
const chatIdFromQuery = computed<string | null>(() => (route.query.chatId as string) || null)

// ==================== 技能详情 ====================
// type 1/2 用 thirdId 调用详情接口，type 3 用 skillId

const { data: cozeDetail, isLoading: isCozeLoading } = useGetCozeDetailQuery(
  computed(() => (skillType.value === 1 ? thirdId.value : '')),
)

const { data: agentDetail, isLoading: isAgentLoading } = useGetAgentDetailQuery(
  computed(() => (skillType.value === 2 ? thirdId.value : '')),
)

const isLoading = computed(() => isCozeLoading.value || isAgentLoading.value)

const detail = computed<CozeBotDetailResp | AgentDetailResp | undefined>(() => {
  if (skillType.value === 1) {
    return cozeDetail.value?.data
  }
  return agentDetail.value?.data
})

/** 判断详情是否为 Coze 智能体 */
function isCozeDetail(d: CozeBotDetailResp | AgentDetailResp | undefined): d is CozeBotDetailResp {
  return d !== undefined && 'botID' in d
}

// 技能名称
const skillName = computed(() => detail.value?.name || 'AI 助手')

// 技能图标
const skillIcon = computed(() => {
  if (isCozeDetail(detail.value)) {
    return detail.value.iconURL || '/robot.png'
  }
  return detail.value?.icon || '/robot.png'
})

// 开场白
const prologue = computed(() => {
  if (isCozeDetail(detail.value)) {
    return detail.value.onboardingInfo?.prologue || ''
  }
  return detail.value?.greeting || ''
})

// 推荐问题
const suggestedQuestions = computed(() => {
  if (isCozeDetail(detail.value)) {
    return detail.value.onboardingInfo?.suggestedQuestions || []
  }
  return detail.value?.promptGuideList || []
})

// 快捷指令
const quickCommands = computed(() => {
  if (isCozeDetail(detail.value)) {
    return detail.value.cityQuickCommands || []
  }
  return []
})

// ==================== 流式对话 ====================

const {
  messages,
  chatId: _chatId,
  isStreaming,
  isReasoning,
  reasoningContent: _reasoningContent,
  sendMessage,
  stopGeneration,
} = useChatStream(skillId, skillType, chatIdFromQuery)

// 反转消息顺序，配合 ChatMessageList 的 flex-col-reverse 使最新消息在底部
const displayMessages = computed(() => [...messages.value].reverse())

// ==================== Agent 表单模板 ====================

/** Agent 是否有表单模板 */
const hasPromptTemplate = computed(() => {
  if (skillType.value !== 2)
    return false
  const agent = agentDetail.value?.data
  return agent?.promptTemplateList && agent.promptTemplateList.length > 0
})

/** 第一个表单模板 */
const firstPromptTemplate = computed(() => {
  return agentDetail.value?.data?.promptTemplateList[0]
})

/** 处理表单提交 */
function handleTemplateSubmit(content: string) {
  sendMessage(content, {
    agentId: thirdId.value,
    mcpMethod: agentDetail.value?.data?.mcpMethod,
  })
}

// ==================== Agent 可视化输出 ====================

/** 是否显示可视化抽屉 */
const isVisionDrawerOpen = ref(false)

/** Agent 可视化能力列表 */
const agentVisionList = computed(() => {
  if (skillType.value !== 2)
    return []
  return agentDetail.value?.data?.agentVisionList ?? []
})

/** 最后一条用户消息的内容 */
const lastUserContent = computed(() => {
  for (let i = messages.value.length - 1; i >= 0; i--) {
    if (messages.value[i]?.role === 'user') {
      return messages.value[i]?.content || messages.value[i]?.finalContent || ''
    }
  }
  return ''
})

/** 最后一条用户消息的 contentId */
const lastUserContentId = computed(() => {
  for (let i = messages.value.length - 1; i >= 0; i--) {
    if (messages.value[i]?.role === 'user') {
      return messages.value[i]?.contentId
    }
  }
  return undefined
})

/** 主对话流完成后自动打开可视化抽屉 */
watch(isStreaming, (streaming) => {
  if (!streaming
    && skillType.value === 2
    && agentVisionList.value.length > 0
    && messages.value.length > 0
    && lastUserContent.value) {
    isVisionDrawerOpen.value = true
  }
})

// ==================== 输入框 ====================

const inputText = ref('')
const inputRef = ref<HTMLTextAreaElement>()

async function handleSend() {
  if (!inputText.value.trim() || isStreaming.value)
    return

  const content = inputText.value.trim()
  inputText.value = ''
  await sendMessage(content)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

// 自动调整输入框高度
function autoResize() {
  const el = inputRef.value
  if (!el)
    return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 120)}px`
}

watch(inputText, autoResize)

// ==================== 快捷操作 ====================

function handleSelectQuestion(question: string) {
  inputText.value = question
  handleSend()
}

function handleQuickCommand(command: CityQuickCommand) {
  // 类型 1:文本 -> 直接发送
  if (command.type === 1) {
    sendMessage(command.content || command.name)
  }
  // 其他类型暂不处理
}
</script>

<template>
  <div class="relative flex h-full flex-col overflow-hidden bg-background">
    <!-- 顶部栏 -->
    <div class="flex items-center justify-between border-b bg-background px-4 py-3 shrink-0">
      <Button
        variant="ghost"
        size="icon"
        class="size-8"
        @click="router.back()"
      >
        <ArrowLeftIcon class="size-4" />
      </Button>

      <div class="flex items-center gap-2">
        <Avatar class="size-7">
          <AvatarImage :src="skillIcon" :alt="skillName" />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
        <span class="text-sm font-medium">{{ skillName }}</span>
      </div>

      <div class="w-8" />
    </div>

    <!-- 加载中 -->
    <div v-if="isLoading" class="flex flex-1 flex-col items-center justify-center space-y-4">
      <Skeleton class="size-12 rounded-full" />
      <Skeleton class="h-4 w-32" />
      <Skeleton class="h-3 w-48" />
    </div>

    <!-- 内容区 -->
    <template v-else>
      <div class="flex flex-1 overflow-hidden">
        <!-- 聊天区 -->
        <div class="flex flex-1 flex-col overflow-hidden">
          <!-- 消息列表：始终显示，欢迎区通过 header 插槽放在顶部 -->
          <StreamChatMessageList
            :messages="displayMessages"
            :streaming="isStreaming"
            empty-text=""
          >
            <template #header>
              <!-- Agent 表单模板：有模板且无消息时展示 -->
              <AgentPromptTemplateForm
                v-if="skillType === 2 && hasPromptTemplate && messages.length === 0 && firstPromptTemplate"
                :template="firstPromptTemplate"
                @submit="handleTemplateSubmit"
              />

              <!-- 欢迎区 -->
              <div
                v-else
                class="flex flex-col items-center justify-center px-4 py-8"
              >
                <!-- 头像 -->
                <Avatar class="size-16 mb-4">
                  <AvatarImage :src="skillIcon" :alt="skillName" />
                  <AvatarFallback class="text-2xl">
                    AI
                  </AvatarFallback>
                </Avatar>

                <!-- 名称 -->
                <h2 class="text-lg font-semibold mb-2">
                  {{ skillName }}
                </h2>

                <!-- 开场白 -->
                <p v-if="prologue" class="text-sm text-muted-foreground text-center max-w-md mb-6">
                  {{ prologue }}
                </p>

                <!-- 推荐问题 -->
                <div v-if="suggestedQuestions.length > 0" class="w-full max-w-md space-y-2">
                  <p class="text-xs text-muted-foreground text-center mb-3">
                    推荐问题
                  </p>
                  <div class="flex flex-wrap gap-2 justify-center">
                    <Button
                      v-for="question in suggestedQuestions"
                      :key="question"
                      variant="outline"
                      size="sm"
                      class="text-xs"
                      @click="handleSelectQuestion(question)"
                    >
                      {{ question }}
                    </Button>
                  </div>
                </div>

                <!-- 快捷指令 -->
                <div v-if="quickCommands.length > 0" class="w-full max-w-md mt-6 space-y-2">
                  <p class="text-xs text-muted-foreground text-center mb-3">
                    快捷指令
                  </p>
                  <div class="flex flex-wrap gap-2 justify-center">
                    <Button
                      v-for="cmd in quickCommands"
                      :key="cmd.uniqueCode"
                      variant="secondary"
                      size="sm"
                      class="text-xs"
                      @click="handleQuickCommand(cmd)"
                    >
                      <span v-if="cmd.icon" class="mr-1">{{ cmd.icon }}</span>
                      {{ cmd.name }}
                    </Button>
                  </div>
                </div>
              </div>
            </template>
          </StreamChatMessageList>

          <!-- 底部输入区 -->
          <div class="border-t bg-background p-3 sm:p-4 shrink-0">
            <!-- 推理中提示 -->
            <div
              v-if="isReasoning"
              class="flex items-center gap-2 text-xs text-muted-foreground mb-2 px-1"
            >
              <Loader2Icon class="size-3 animate-spin" />
              <span>正在思考...</span>
            </div>

            <div class="flex items-end gap-2 rounded-lg border border-input bg-card px-3 py-2 focus-within:ring-1 focus-within:ring-ring">
              <textarea
                ref="inputRef"
                v-model="inputText"
                placeholder="输入消息..."
                rows="1"
                class="min-h-[36px] max-h-[120px] flex-1 resize-none bg-transparent py-2 text-sm outline-none"
                :disabled="isStreaming"
                @keydown="handleKeydown"
              />

              <Button
                v-if="isStreaming"
                variant="destructive"
                size="icon"
                class="size-8 rounded-full shrink-0"
                @click="stopGeneration"
              >
                <span class="size-2.5 rounded-full bg-white" />
              </Button>
              <Button
                v-else
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

        <!-- 可视化输出抽屉 -->
        <AgentVisionDrawer
          v-model:open="isVisionDrawerOpen"
          :visions="agentVisionList"
          :chat-id="_chatId ?? ''"
          :content-id="lastUserContentId"
          :content="lastUserContent"
        />
      </div>
    </template>
  </div>
</template>

<route lang="yaml">
meta:
  auth: true
  layout: 'fixed'
</route>
