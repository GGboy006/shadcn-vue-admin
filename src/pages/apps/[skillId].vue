<script setup lang="ts">
import { ArrowLeftIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import type { IChoiceOption } from './types/wizard.types'

import AiChatBubble from './components/ai-chat-bubble.vue'
import ChoiceGrid from './components/choice-grid.vue'
import ChoiceList from './components/choice-list.vue'
import GenerationLoading from './components/generation-loading.vue'
import ResultPreview from './components/result-preview.vue'
import StepIndicator from './components/step-indicator.vue'
import { useTypewriter } from './composables/use-typewriter'
import { useWizard } from './composables/use-wizard'

const route = useRoute()
const router = useRouter()
const skillId = computed(() => (route.params as Record<string, string>).skillId)

// 向导状态管理
const wizard = useWizard(skillId)

// 打字机效果（用于展示 aiContent）
const { displayText: typewriterText, isTyping: isTypewriterTyping } = useTypewriter(wizard.aiContent, 10)

// 页面挂载时强制重置向导状态（确保离开再进入时重新初始化）
onMounted(() => {
  wizard.resetWizard()
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

  // AI 生成步骤：调用图片生成并进入下一步
  if (flow.actionType === 2) {
    await wizard.generateImage()
    return
  }

  // 确认/结束步骤
  if (flow.actionType === 4) {
    // 流程结束，可重置或返回
    wizard.resetWizard()
    return
  }

  wizard.goToNextStep()
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

        <!-- 占位 -->
        <div class="w-16" />
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

        <!-- AI 生成步骤 - 处理完成，等待图片生成 -->
        <div
          v-else-if="isGenerationStep && !wizard.isProcessing.value && !wizard.isGenerating.value && wizard.generationStatus.value !== 2"
          class="py-6"
        >
          <div class="rounded-lg bg-muted/50 p-4 text-sm text-foreground leading-relaxed min-h-[120px]">
            {{ typewriterText || wizard.currentFlow.value?.description }}
          </div>
        </div>

        <!-- AI 生成步骤 - 图片生成中 -->
        <GenerationLoading
          v-else-if="isGenerationStep && wizard.isGenerating.value"
          :step-name="wizard.currentFlow.value.stepName"
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
        <ResultPreview
          v-else-if="isCompletionStep && wizard.generatedImageUrl.value"
          :image-url="wizard.generatedImageUrl.value"
          :prompt="wizard.aiContent.value"
          @regenerate="wizard.handleRegenerate()"
          @download="handleDownload"
        />

        <!-- 完成步骤 - 无结果 -->
        <div v-else-if="isCompletionStep" class="text-center py-8">
          <p class="text-muted-foreground">
            {{ wizard.currentFlow.value.description }}
          </p>
        </div>

        <!-- 操作按钮区 -->
        <div
          v-if="isUserChoiceStep || isGenerationStep"
          class="flex items-center justify-between pt-4"
        >
          <Button
            variant="ghost"
            :disabled="wizard.currentStepIndex.value === 0 || wizard.isGenerating.value"
            @click="handleBack"
          >
            上一步
          </Button>

          <!-- AI 生成步骤：生成中时显示加载状态，不可点击 -->
          <Button
            v-if="isGenerationStep"
            :disabled="wizard.isGenerating.value || wizard.isProcessing.value"
          >
            <span v-if="wizard.isGenerating.value || wizard.isProcessing.value" class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {{ wizard.isGenerating.value || wizard.isProcessing.value ? '生成中...' : '下一步' }}
          </Button>

          <!-- 普通选择步骤 -->
          <Button
            v-else
            :disabled="!wizard.isCurrentStepValid.value"
            @click="handleNext"
          >
            下一步
          </Button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-20">
        <p class="text-muted-foreground">
          暂无流程数据
        </p>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  auth: true
</route>
