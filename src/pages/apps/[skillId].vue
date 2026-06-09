<script setup lang="ts">
import { ArrowLeftIcon, SendIcon, StoreIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiFetch } from '@/composables/use-fetch'
import { useGetSkillMerchantsQuery } from '@/services/api/skill.api'
import { useAuthStore } from '@/stores/auth'
import { useStationRegenerateStore } from '@/stores/station-regenerate'

import type { IChoiceOption } from './types/wizard.types'

import AiChatBubble from './components/ai-chat-bubble.vue'
import ChoiceGrid from './components/choice-grid.vue'
import ChoiceList from './components/choice-list.vue'
import GenerationConfirm from './components/generation-confirm.vue'
import GenerationLoading from './components/generation-loading.vue'
import ResultPreview from './components/result-preview.vue'
import StepIndicator from './components/step-indicator.vue'
import { useTypewriter } from './composables/use-typewriter'
import { useWizard } from './composables/use-wizard'

const route = useRoute()
const router = useRouter()
const skillId = computed(() => (route.params as Record<string, string>).skillId)
const authStore = useAuthStore()

// 向导状态管理
const wizard = useWizard(skillId)

// 打字机效果（用于展示 aiContent）
const { displayText: typewriterText, isTyping: isTypewriterTyping } = useTypewriter(wizard.aiContent, 10)

// 是否站长重新生成模式
const isStationRegenerateMode = computed(() => route.query.mode === 'station_regenerate')

// 是否站长直接创建模式（从工具列表进入，需要选择商户）
const isStationDirectMode = computed(() => {
  return authStore.getUserType() === 3 && !isStationRegenerateMode.value
})

// 站长模式：原始会话ID（用于发送消息，不用于生成）
const stationChatId = ref<string | null>(null)

// ==================== 站长选择商户 ====================

// 查询已分配该技能的商户列表
const { data: merchantsData, isLoading: isMerchantsLoading } = useGetSkillMerchantsQuery(skillId)
const merchantList = computed(() => merchantsData.value?.data || [])

// 是否显示商户选择弹窗
const showMerchantSelect = ref(false)

// 选中的商户
const selectedMerchant = ref<{ merchantCode: string, merchantName: string } | null>(null)

// 选择商户
function selectMerchant(merchant: { merchantCode: string, merchantName: string }) {
  selectedMerchant.value = merchant
  wizard.setStationMerchantCode(merchant.merchantCode)
  showMerchantSelect.value = false
}

// 页面挂载时处理初始化
onMounted(() => {
  if (isStationRegenerateMode.value) {
    // 站长重新生成模式：从 store 获取数据并预填充
    const stationStore = useStationRegenerateStore()
    const data = stationStore.getRegenerateData()

    if (data) {
      const { chatId, merchantCode, steps } = data
      // 保存原始 chatId，用于后续发送消息
      stationChatId.value = chatId
      // 等待技能详情加载完成后初始化
      let unwatch: (() => void) | null = null
      unwatch = watch(() => wizard.skillDetail.value, (detail) => {
        if (detail && detail.flows.length > 0) {
          wizard.initWithStationData({ chatId, merchantCode, steps })
          unwatch?.()
        }
      }, { immediate: true })
    }
    else {
      toast.error('数据已过期，请重新操作')
    }
  }
  else if (isStationDirectMode.value) {
    // 站长直接创建模式：显示商户选择弹窗
    showMerchantSelect.value = true
    wizard.resetWizard()
  }
  else {
    // 普通模式：重置向导
    wizard.resetWizard()
  }
})

// 处理选择
function handleSelect(field: string, value: string, option?: IChoiceOption) {
  wizard.makeChoice(field, value, option)
}

// 处理下一步
async function handleNext() {
  const flow = wizard.currentFlow.value
  if (!flow)
    return

  // 确认/结束步骤
  if (flow.actionType === 4) {
    // 流程结束，可重置或返回
    wizard.resetWizard()
    return
  }

  wizard.goToNextStep()
}

// 处理生成按钮点击
async function handleGenerate() {
  await wizard.streamPrompt()
}

// 处理返回
function handleBack() {
  wizard.goToPrevStep()
}

// 处理下载
function handleDownload() {
  if (wizard.generatedImageUrl.value) {
    const link = document.createElement('a')
    link.href = wizard.generatedImageUrl.value
    link.download = `ai-generated-${Date.now()}.png`
    link.target = '_blank'
    link.click()
  }
}

// ==================== 站长专属功能 ====================

const { apiFetch } = useApiFetch()

/** 发送给商户 */
const stationSendInput = ref('')
const isSending = ref(false)

async function handleSendToMerchant() {
  if (!stationSendInput.value.trim() || !stationChatId.value)
    return

  isSending.value = true

  try {
    // 1. 先调用站长接管会话
    await apiFetch('/aiCommon/stationTakeover', {
      method: 'post',
      params: {
        chatId: stationChatId.value,
      },
    })

    // 2. 发送消息（携带图片生成ID）
    await apiFetch('/aiCommon/sendManualTakeoverMessage', {
      method: 'post',
      params: {
        chatId: stationChatId.value,
        content: stationSendInput.value,
        imageGenerationId: wizard.generationId.value ?? undefined,
      },
    })

    toast.success('发送成功')
    stationSendInput.value = ''

    // 返回聊天工作台
    router.push('/admin/chat-workbench')
  }
  catch {
    toast.error('发送失败')
  }
  finally {
    isSending.value = false
  }
}

// 步骤名称列表
const stepNames = computed(() => {
  return wizard.flows.value.map(f => f.stepName)
})

// 是否是用户选择步骤
const isUserChoiceStep = computed(() => {
  return wizard.currentFlow.value?.actionType === 1
})

// 是否是 AI 生成步骤
const isGenerationStep = computed(() => {
  return wizard.currentFlow.value?.actionType === 2
})

// 是否是完成步骤
const isCompletionStep = computed(() => {
  return wizard.currentFlow.value?.actionType === 4
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-background to-muted/20">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-4 pb-8">
      <!-- 顶部导航 -->
      <div class="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" @click="router.back()">
          <ArrowLeftIcon class="size-4 mr-1" />
          返回
        </Button>

        <!-- 技能名称 -->
        <h1 class="text-lg font-semibold">
          {{ wizard.skillDetail.value?.name || 'AI 工具' }}
        </h1>

        <!-- 站长模式：已选商户 -->
        <div
          v-if="selectedMerchant"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs"
        >
          <StoreIcon class="size-3.5" />
          <span class="truncate max-w-[120px]">{{ selectedMerchant.merchantName }}</span>
        </div>
        <div v-else class="w-16" />
      </div>

      <!-- 步骤指示器 -->
      <StepIndicator
        v-if="wizard.flows.value.length > 0"
        :current="wizard.currentStepIndex.value"
        :total="wizard.totalSteps.value"
        :completed="wizard.completedStepCodes.value"
        :step-names="stepNames"
        class="mb-8"
      />

      <!-- 加载状态 -->
      <div v-if="wizard.isDetailLoading.value" class="space-y-4">
        <Skeleton class="h-20 w-full" />
        <Skeleton class="h-40 w-full" />
        <Skeleton class="h-12 w-full" />
      </div>

      <!-- 向导内容 -->
      <div v-else-if="wizard.currentFlow.value" class="space-y-6">
        <!-- AI 对话气泡 -->
        <AiChatBubble
          :content="wizard.currentFlow.value.description"
          :avatar="wizard.skillDetail.value?.icon"
          :is-typing="wizard.isProcessing.value"
        />

        <!-- 用户选择步骤 -->
        <div v-if="isUserChoiceStep && wizard.currentStepConfig.value" class="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <!-- 步骤标题 -->
          <h3 v-if="wizard.currentStepConfig.value.title" class="text-sm font-medium text-muted-foreground mb-3">
            {{ wizard.currentStepConfig.value.title }}
          </h3>

          <!-- 多字段渲染 -->
          <div
            v-for="field in wizard.currentStepConfig.value.fields"
            :key="field.field"
            class="space-y-3"
          >
            <!-- 字段标签 -->
            <h4 v-if="wizard.currentStepConfig.value.layout === 'grouped'" class="text-sm font-medium">
              {{ field.label }}
            </h4>

            <!-- Grid 布局 -->
            <ChoiceGrid
              v-if="field.layout === 'grid'"
              :options="field.options"
              :selected-value="wizard.userChoices.value[field.field]"
              @select="(value: string, option: IChoiceOption) => handleSelect(field.field, value, option)"
            />

            <!-- List 布局 -->
            <ChoiceList
              v-else
              :options="field.options"
              :selected-value="wizard.userChoices.value[field.field]"
              @select="(value: string, option: IChoiceOption) => handleSelect(field.field, value, option)"
            />
          </div>
        </div>

        <!-- AI 生成步骤 - 确认页（未开始生成时） -->
        <GenerationConfirm
          v-else-if="isGenerationStep && !wizard.isProcessing.value && !wizard.isGenerating.value && wizard.generationStatus.value !== 1 && wizard.generationStatus.value !== 2"
          v-model="wizard.stationModifyPrompt.value"
          :step-name="wizard.currentFlow.value.stepName"
          :step-forms="wizard.stepForms.value"
          :is-station-mode="wizard.isStationMode.value"
          @generate="handleGenerate"
        />

        <!-- AI 生成步骤 - 处理中/展示 aiContent 打字机效果 -->
        <div
          v-else-if="isGenerationStep && (wizard.isProcessing.value || isTypewriterTyping)"
          class="py-6"
        >
          <div class="rounded-lg bg-muted/50 p-4 text-sm text-foreground leading-relaxed min-h-[120px]">
            {{ typewriterText }}
            <span v-if="isTypewriterTyping" class="animate-pulse">▍</span>
          </div>
        </div>

        <!-- AI 生成步骤 - 图片生成中 -->
        <GenerationLoading
          v-else-if="isGenerationStep && wizard.isGenerating.value"
          :step-name="wizard.currentFlow.value.stepName"
          :streaming-content="wizard.aiContent.value"
        />

        <!-- 生成失败 -->
        <div
          v-else-if="isGenerationStep && wizard.generationStatus.value === 2"
          class="text-center py-8"
        >
          <p class="text-destructive mb-4">
            {{ wizard.generationError.value || '生成失败' }}
          </p>
          <Button @click="wizard.handleRegenerate()">
            重新生成
          </Button>
        </div>

        <!-- 完成步骤 - 结果展示 -->
        <template v-else-if="isCompletionStep">
          <!-- 结果图片（普通模式 或 站长生成后） -->
          <ResultPreview
            v-if="wizard.generatedImageUrl.value"
            :image-url="wizard.generatedImageUrl.value"
            :prompt="wizard.aiContent.value"
            :tag="wizard.isStationMode.value ? '站长生成' : undefined"
            @regenerate="wizard.handleRegenerate()"
            @download="handleDownload"
          />

          <!-- 完成步骤 - 无结果 -->
          <div v-else class="text-center py-8">
            <p class="text-muted-foreground">
              {{ wizard.currentFlow.value.description }}
            </p>
          </div>

          <!-- 站长专属：发送给商户 -->
          <div
            v-if="wizard.isStationMode.value && wizard.generationStatus.value === 1 && wizard.generatedImageUrl.value"
            class="rounded-xl border bg-card p-4 mt-4"
          >
            <label class="text-sm font-medium mb-2 block">
              发送给商户
            </label>
            <textarea
              v-model="stationSendInput"
              placeholder="请输入要发送给商户的消息..."
              rows="2"
              class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div class="flex gap-2 mt-3">
              <Button
                variant="outline"
                class="flex-1"
                @click="router.push('/admin/chat-workbench')"
              >
                返回工作台
              </Button>
              <Button
                class="flex-1"
                :disabled="!stationSendInput.trim() || isSending"
                @click="handleSendToMerchant"
              >
                <SendIcon class="size-4 mr-2" />
                {{ isSending ? '发送中...' : '发送给商户' }}
              </Button>
            </div>
          </div>
        </template>

        <!-- 操作按钮区 -->
        <div
          v-if="isUserChoiceStep"
          class="flex items-center justify-between pt-4"
        >
          <Button
            variant="ghost"
            :disabled="wizard.currentStepIndex.value === 0"
            @click="handleBack"
          >
            上一步
          </Button>

          <!-- 普通选择步骤 -->
          <Button
            :disabled="!wizard.isCurrentStepValid.value"
            @click="handleNext"
          >
            下一步
          </Button>
        </div>

        <!-- AI 生成步骤 - 确认页时的上一步按钮 -->
        <div
          v-if="isGenerationStep && !wizard.isProcessing.value && !wizard.isGenerating.value && wizard.generationStatus.value !== 1 && wizard.generationStatus.value !== 2"
          class="flex items-center justify-between pt-4"
        >
          <Button
            variant="ghost"
            :disabled="wizard.currentStepIndex.value === 0"
            @click="handleBack"
          >
            上一步
          </Button>
          <div />
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-20">
        <p class="text-muted-foreground">
          暂无流程数据
        </p>
      </div>
    </div>

    <!-- 站长选择商户弹窗 -->
    <div
      v-if="showMerchantSelect"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="showMerchantSelect = false"
    >
      <div class="w-full max-w-md mx-4 bg-background rounded-xl border shadow-lg p-6">
        <div class="flex items-center gap-2 mb-4">
          <StoreIcon class="size-5 text-primary" />
          <h2 class="text-lg font-semibold">
            选择商户
          </h2>
        </div>
        <p class="text-sm text-muted-foreground mb-4">
          请选择要使用此工具的商户，以便获取该商户的商品和促销数据
        </p>

        <!-- 加载中 -->
        <div v-if="isMerchantsLoading" class="space-y-3">
          <Skeleton v-for="i in 3" :key="i" class="h-16 w-full" />
        </div>

        <!-- 商户列表 -->
        <div v-else-if="merchantList.length > 0" class="space-y-2 max-h-80 overflow-y-auto">
          <div
            v-for="merchant in merchantList"
            :key="merchant.merchantId"
            class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
            :class="{ 'border-primary bg-primary/5': selectedMerchant?.merchantCode === merchant.merchantCode }"
            @click="selectMerchant(merchant)"
          >
            <img
              v-if="merchant.logo"
              :src="merchant.logo"
              class="w-10 h-10 rounded-full object-cover"
              alt="logo"
            >
            <div v-else class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <StoreIcon class="size-5 text-primary" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">
                {{ merchant.merchantName }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ merchant.contactName }} {{ merchant.contactPhone }}
              </p>
            </div>
            <div
              v-if="selectedMerchant?.merchantCode === merchant.merchantCode"
              class="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
            >
              <svg class="size-3 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          </div>
        </div>

        <!-- 无数据 -->
        <div v-else class="text-center py-8 text-muted-foreground">
          <p>暂无已分配该技能的商户</p>
        </div>

        <!-- 底部按钮 -->
        <div class="flex gap-3 mt-4 pt-4 border-t">
          <Button
            variant="outline"
            class="flex-1"
            @click="showMerchantSelect = false"
          >
            取消
          </Button>
          <Button
            class="flex-1"
            :disabled="!selectedMerchant"
            @click="showMerchantSelect = false"
          >
            确认选择
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  auth: true
</route>
