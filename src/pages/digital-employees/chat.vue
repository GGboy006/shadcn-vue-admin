<script setup lang="ts">
import { ArrowLeftIcon, XIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { IUploadedChatFile } from '@/services/api/chat-upload.api'
import type { IDigitalEmployee } from '@/services/api/digital-employee.api'

import ChatPanel from '@/components/chat/ChatPanel.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useChatUploadFile } from '@/services/api/chat-upload.api'
import {
  mapAgentScopePresentation,
  onlineStatusConfig,
  useGetAgentScopeAgentDetailQuery,
  useGetDepartmentEmployeeListQuery,
} from '@/services/api/digital-employee.api'
import { useGetAgentDetailQuery } from '@/services/api/skill.api'
import { chatStreamFileType } from '@/utils/chat-upload-file'

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

const aiType = computed(() => employee.value?.aiType)

// type 2：LoongAI Agent 详情（开场白 / 推荐问题 / 表单 / mcpMethod）
// type 3：AgentScope 专用运行配置（presentation.welcomeMessage / recommendedQuestions）
const aiThirdId = computed(() => employee.value?.aiThirdId ?? '')
const { data: agentDetail, isLoading: isAgentLoading } = useGetAgentDetailQuery(
  computed(() => (aiType.value === 2 ? aiThirdId.value : '')),
)
const { data: agentScopeDetail, isLoading: isAgentScopeLoading } = useGetAgentScopeAgentDetailQuery(
  computed(() => (aiType.value === 3 ? aiThirdId.value : '')),
)
const agentScopePresentation = computed(() => mapAgentScopePresentation(agentScopeDetail.value?.data))
const aiChatTypeCode = computed(() => agentScopeDetail.value?.data?.aiChatTypeCode ?? null)

/** Agent 是否有表单模板 */
const hasPromptTemplate = computed(() => {
  if (aiType.value !== 2)
    return false
  const list = agentDetail.value?.data?.promptTemplateList
  return !!list && list.length > 0
})

/** 第一个表单模板 */
const firstPromptTemplate = computed(() => agentDetail.value?.data?.promptTemplateList?.[0])

/** 推荐问题：type 2 走 LoongAI 详情，type 3 走 AgentScope presentation */
const suggestedQuestions = computed(() => {
  if (aiType.value === 2)
    return agentDetail.value?.data?.promptGuideList ?? []
  if (aiType.value === 3)
    return agentScopePresentation.value.recommendedQuestions
  return []
})

/** Agent 流式对话需携带的参数 */
const agentSendOptions = computed(() =>
  aiType.value === 2
    ? { agentId: aiThirdId.value, mcpMethod: agentDetail.value?.data?.mcpMethod }
    : undefined,
)

// ==================== 开场白 ====================

// type 3 用 AgentScope welcomeMessage；type 2 用 LoongAI greeting；无则本地拼接
const welcomeContent = computed(() => {
  const emp = employee.value
  if (!emp)
    return ''
  if (aiType.value === 3 && agentScopePresentation.value.welcomeMessage)
    return agentScopePresentation.value.welcomeMessage
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
  sendMessage,
  stopGeneration,
  seedWelcomeMessage,
} = useEmployeeChatStream(
  employeeId,
  aiType,
  welcomeContent,
  initialChatId,
)

/** 是否已有用户消息（用于控制表单/推荐问题展示） */
const hasUserMessage = computed(() => messages.value.some(m => m.role === 'user'))

const visibleSuggestions = computed(() => {
  if (isHistoryMode.value || hasUserMessage.value || hasPromptTemplate.value)
    return []
  return suggestedQuestions.value
})

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
  // type 2 / 3 需等各自详情返回后再决定是否注入欢迎气泡
  if (aiType.value === 2) {
    if (isAgentLoading.value)
      return
    if (hasPromptTemplate.value) {
      welcomeSeeded.value = true
      return
    }
  }
  if (aiType.value === 3 && isAgentScopeLoading.value)
    return
  if (welcomeContent.value) {
    seedWelcomeMessage()
    welcomeSeeded.value = true
  }
})

// ==================== 输入框 ====================

const inputText = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const pendingFiles = ref<IUploadedChatFile[]>([])
const uploading = ref(false)
const { uploadChatFile } = useChatUploadFile()

function handlePickAttachments() {
  if (aiType.value !== 3)
    return
  if (aiChatTypeCode.value == null) {
    toast.error('当前模型不支持上传文件')
    return
  }
  fileInputRef.value?.click()
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = [...(input.files ?? [])]
  input.value = ''
  const fileType = aiChatTypeCode.value
  if (fileType == null || !files.length)
    return

  uploading.value = true
  try {
    for (const file of files) {
      const uploaded = await uploadChatFile(file, fileType)
      pendingFiles.value.push(uploaded)
    }
  }
  catch {
    // 失败提示由请求层弹出
  }
  finally {
    uploading.value = false
  }
}

function removePendingFile(chatFileId: string) {
  pendingFiles.value = pendingFiles.value.filter(file => file.chatFileId !== chatFileId)
}

async function handleSend() {
  if (uploading.value || isStreaming.value)
    return
  const content = inputText.value.trim()
  const files = pendingFiles.value.map(file => ({
    fileId: file.chatFileId,
    fileType: chatStreamFileType(file.mime),
    fileName: file.fileName,
    fileUrl: file.fileUrl,
    fileSize: file.bytes,
  }))
  if (!content && !files.length)
    return
  inputText.value = ''
  pendingFiles.value = []
  await sendMessage(content, { ...agentSendOptions.value, files })
}

/** 表单模板提交 */
function handleTemplateSubmit(content: string) {
  sendMessage(content, agentSendOptions.value)
}

/** 点击推荐问题：只填入输入框 */
function handleSelectQuestion(question: string) {
  inputText.value = question
}
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
      <input
        ref="fileInputRef"
        type="file"
        class="sr-only"
        multiple
        :disabled="uploading"
        @change="handleFileChange"
      >
      <ChatPanel
        v-model:input="inputText"
        :messages="messages"
        :streaming="isStreaming"
        :suggestions="visibleSuggestions"
        :placeholder="employee ? `向 ${employee.employeeName} 发送消息...` : '输入消息...'"
        :input-disabled="!employee"
        :attachment="aiType === 3"
        :can-submit-extra="pendingFiles.length > 0 && !uploading"
        empty-text="发送消息开始对话"
        @submit="handleSend"
        @stop="stopGeneration"
        @pick-attachments="handlePickAttachments"
        @select-suggestion="handleSelectQuestion"
      >
        <template #header>
          <AgentPromptTemplateForm
            v-if="!isHistoryMode && aiType === 2 && hasPromptTemplate && !hasUserMessage && firstPromptTemplate"
            :template="firstPromptTemplate"
            @submit="handleTemplateSubmit"
          />
        </template>
        <template v-if="pendingFiles.length || uploading" #input-header>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="file in pendingFiles"
              :key="file.chatFileId"
              class="flex max-w-full items-center gap-2 rounded-md border px-2 py-1 text-xs"
            >
              <img
                v-if="chatStreamFileType(file.mime) === 'image' && file.fileUrl"
                :src="file.fileUrl"
                :alt="file.fileName"
                class="size-8 rounded object-cover"
              >
              <span class="max-w-40 truncate">{{ file.fileName }}</span>
              <button
                type="button"
                class="text-muted-foreground"
                aria-label="移除文件"
                @click="removePendingFile(file.chatFileId)"
              >
                <XIcon class="size-3" />
              </button>
            </div>
            <span v-if="uploading" class="text-xs text-muted-foreground">正在上传...</span>
          </div>
        </template>
      </ChatPanel>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  auth: true
  roles: [3]
  layout: 'fixed'
</route>
