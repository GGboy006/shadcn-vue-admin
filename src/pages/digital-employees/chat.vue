<script setup lang="ts">
import { ArrowLeftIcon, Loader2Icon, SendIcon } from '@lucide/vue'

import type { IDigitalEmployee } from '@/services/api/digital-employee.api'

import StreamChatMessageList from '@/components/chat/StreamChatMessageList.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { onlineStatusConfig, useGetDepartmentEmployeeListQuery } from '@/services/api/digital-employee.api'
import { useGetAgentDetailQuery } from '@/services/api/skill.api'

import AgentPromptTemplateForm from '../apps/components/AgentPromptTemplateForm.vue'
import { useEmployeeChatStream } from './composables/use-employee-chat-stream'

const route = useRoute()
const router = useRouter()

const employeeId = computed(() => (route.query.employeeId as string) || '')
/** 初始会话ID：从会话列表“查看详情”进入时携带，用于加载历史 */
const initialChatId = computed<string | null>(() => (route.query.chatId as string) || null)
/** 是否从历史会话进入（此时不注入开场白，直接展示历史） */
const isHistoryMode = computed(() => !!initialChatId.value)

// ==================== 员工信息（复用部门列表查询缓存） ====================

const { data: listData, isLoading } = useGetDepartmentEmployeeListQuery()

const employee = computed<IDigitalEmployee | undefined>(() => {
  const departments = listData.value?.data ?? []
  for (const dept of departments) {
    const found = dept.employeeList?.find(e => String(e.employeeId) === employeeId.value)
    if (found)
      return found
  }
  return undefined
})

const statusConfig = computed(() =>
  onlineStatusConfig[employee.value?.onlineStatus ?? 0] ?? onlineStatusConfig[0],
)

/** 顶部副标题：职位 · 部门 · 已完成 X 任务 */
const subtitleParts = computed(() => {
  const emp = employee.value
  if (!emp)
    return []
  const parts: string[] = []
  if (emp.title)
    parts.push(emp.title)
  if (emp.departmentName)
    parts.push(emp.departmentName)
  parts.push(`已完成 ${(emp.taskCount ?? 0).toLocaleString()} 任务`)
  return parts
})

// ==================== 流式对话 ====================

const aiType = computed(() => employee.value?.aiType ?? 1)

// Agent（type 2）详情：包含开场白、推荐问题、表单模板、mcpMethod
const aiThirdId = computed(() => employee.value?.aiThirdId ?? '')
const { data: agentDetail, isLoading: isAgentLoading } = useGetAgentDetailQuery(
  computed(() => (aiType.value === 2 ? aiThirdId.value : '')),
)

/** Agent 是否有表单模板 */
const hasPromptTemplate = computed(() => {
  if (aiType.value !== 2)
    return false
  const list = agentDetail.value?.data?.promptTemplateList
  return !!list && list.length > 0
})

/** 第一个表单模板 */
const firstPromptTemplate = computed(() => agentDetail.value?.data?.promptTemplateList?.[0])

/** 推荐问题（type 2 才有） */
const suggestedQuestions = computed(() =>
  aiType.value === 2 ? (agentDetail.value?.data?.promptGuideList ?? []) : [],
)

/** Agent 流式对话需携带的参数 */
const agentSendOptions = computed(() =>
  aiType.value === 2
    ? { agentId: aiThirdId.value, mcpMethod: agentDetail.value?.data?.mcpMethod }
    : undefined,
)

// ==================== 开场白 ====================

// 优先使用 detail 接口返回的 greeting 问候语（开场白），无则本地拼接兼底
const welcomeContent = computed(() => {
  const emp = employee.value
  if (!emp)
    return ''
  const greeting = agentDetail.value?.data?.greeting?.trim()
  if (greeting)
    return greeting
  const intro = `您好！我是${emp.employeeName}，${emp.title}。${emp.description || ''}`
  const tags = emp.tags?.length
    ? `\n\n您可以问我关于${emp.tags.join('、')}等方面的问题，我会尽力为您解答。`
    : ''
  return `${intro}${tags}`
})

const {
  messages,
  isStreaming,
  isReasoning,
  sendMessage,
  stopGeneration,
  seedWelcomeMessage,
} = useEmployeeChatStream(
  employeeId,
  aiType as Ref<1 | 2>,
  welcomeContent,
  initialChatId,
)

/** 是否已有用户消息（用于控制表单/推荐问题展示） */
const hasUserMessage = computed(() => messages.value.some(m => m.role === 'user'))

// 注入开场白：历史会话不注入；type 2 有表单时不注入欢迎气泡，改为展示表单
const welcomeSeeded = ref(false)
watchEffect(() => {
  if (welcomeSeeded.value || !employee.value)
    return
  // 历史会话直接展示已有消息，不注入开场白
  if (isHistoryMode.value) {
    welcomeSeeded.value = true
    return
  }
  // type 2 需等详情返回后再决定是否注入欢迎气泡
  if (aiType.value === 2) {
    if (isAgentLoading.value)
      return
    if (hasPromptTemplate.value) {
      welcomeSeeded.value = true
      return
    }
  }
  if (welcomeContent.value) {
    seedWelcomeMessage()
    welcomeSeeded.value = true
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
  await sendMessage(content, agentSendOptions.value)
}

/** 表单模板提交 */
function handleTemplateSubmit(content: string) {
  sendMessage(content, agentSendOptions.value)
}

/** 点击推荐问题 */
function handleSelectQuestion(question: string) {
  inputText.value = question
  handleSend()
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function autoResize() {
  const el = inputRef.value
  if (!el)
    return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 120)}px`
}

watch(inputText, autoResize)
</script>

<template>
  <div class="relative flex h-full flex-col overflow-hidden bg-background">
    <!-- 顶部吸顶信息条 -->
    <div class="flex items-center gap-3 border-b bg-primary/5 px-4 py-3 shrink-0">
      <Button
        variant="ghost"
        size="icon"
        class="size-8"
        @click="router.back()"
      >
        <ArrowLeftIcon class="size-4" />
      </Button>

      <template v-if="employee">
        <Avatar class="size-9 shrink-0">
          <AvatarImage :src="employee.logo || ''" :alt="employee.employeeName" />
          <AvatarFallback>{{ employee.employeeName?.slice(0, 1) || 'AI' }}</AvatarFallback>
        </Avatar>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold">{{ employee.employeeName }}</span>
            <Badge :variant="statusConfig.variant" class="text-xs">
              {{ statusConfig.label }}
            </Badge>
          </div>
          <p class="mt-0.5 text-xs text-muted-foreground line-clamp-1">
            {{ subtitleParts.join(' · ') }}
          </p>
        </div>
      </template>

      <template v-else-if="isLoading">
        <Skeleton class="size-9 rounded-full" />
        <div class="space-y-1">
          <Skeleton class="h-4 w-24" />
          <Skeleton class="h-3 w-40" />
        </div>
      </template>
    </div>

    <!-- 内容区 -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <StreamChatMessageList
        :messages="messages"
        :streaming="isStreaming"
        empty-text="发送消息开始对话"
      >
        <template #header>
          <!-- Agent 表单模板：有模板且无用户消息时展示 -->
          <AgentPromptTemplateForm
            v-if="!isHistoryMode && aiType === 2 && hasPromptTemplate && !hasUserMessage && firstPromptTemplate"
            :template="firstPromptTemplate"
            @submit="handleTemplateSubmit"
          />

          <!-- 推荐问题：Agent 无表单且无用户消息时展示 -->
          <div
            v-else-if="!isHistoryMode && suggestedQuestions.length > 0 && !hasUserMessage"
            class="flex flex-col items-center gap-3 px-4 pt-6 pb-2"
          >
            <p class="text-xs text-muted-foreground">
              推荐问题
            </p>
            <div class="flex flex-wrap justify-center gap-2">
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
        </template>
      </StreamChatMessageList>

      <!-- 底部输入区 -->
      <div class="border-t bg-background p-3 sm:p-4 shrink-0">
        <!-- 推理中提示 -->
        <div
          v-if="isReasoning"
          class="mb-2 flex items-center gap-2 px-1 text-xs text-muted-foreground"
        >
          <Loader2Icon class="size-3 animate-spin" />
          <span>正在思考...</span>
        </div>

        <div class="flex items-end gap-2 rounded-lg border border-input bg-card px-3 py-2 focus-within:ring-1 focus-within:ring-ring">
          <textarea
            ref="inputRef"
            v-model="inputText"
            :placeholder="employee ? `向 ${employee.employeeName} 发送消息...` : '输入消息...'"
            rows="1"
            class="min-h-[36px] max-h-[120px] flex-1 resize-none bg-transparent py-2 text-sm outline-none"
            :disabled="isStreaming"
            @keydown="handleKeydown"
          />

          <Button
            v-if="isStreaming"
            variant="destructive"
            size="icon"
            class="size-8 shrink-0 rounded-full"
            @click="stopGeneration"
          >
            <span class="size-2.5 rounded-full bg-white" />
          </Button>
          <Button
            v-else
            variant="default"
            size="icon"
            class="size-8 shrink-0 rounded-full"
            :disabled="!inputText.trim()"
            @click="handleSend"
          >
            <SendIcon class="size-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  auth: true
  roles: [3]
  layout: 'fixed'
</route>
