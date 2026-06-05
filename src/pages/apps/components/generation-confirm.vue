<script setup lang="ts">
import { SparklesIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'

import type { IWizardStepForm } from '../types/wizard.types'

interface Props {
  stepName?: string
  stepForms: IWizardStepForm[]
}

const props = withDefaults(defineProps<Props>(), {
  stepName: 'AI生成海报',
})

const emit = defineEmits<{
  generate: []
}>()

function handleGenerate() {
  emit('generate')
}

// 过滤出有实际选择的步骤
const selectedSteps = computed(() => {
  return props.stepForms.filter((step) => {
    // 只保留有字段值的步骤
    return step.fieldValues.some(fv =>
      fv.value !== undefined && fv.value !== '' && fv.value !== null,
    )
  })
})
</script>

<template>
  <div class="flex flex-col">
    <!-- 标题区 -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold">
        {{ stepName }}
      </h3>
      <p class="text-sm text-muted-foreground mt-1">
        确认配置信息，点击生成海报
      </p>
    </div>

    <!-- 已选配置卡片 -->
    <div class="rounded-xl border bg-card p-5 mb-6">
      <h4 class="text-sm font-medium text-muted-foreground mb-4">
        已选配置
      </h4>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        <div
          v-for="step in selectedSteps"
          :key="step.stepCode"
          class="space-y-2"
        >
          <div
            v-for="fv in step.fieldValues.filter(f => f.value !== undefined && f.value !== '' && f.value !== null)"
            :key="fv.field"
            class="flex items-center gap-2 text-sm"
          >
            <!-- 图标 -->
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

            <!-- 标签和值 -->
            <span class="text-muted-foreground">{{ fv.label }}</span>
            <span class="font-medium">{{ fv.selectedOptions?.[0]?.label || fv.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 生成按钮 -->
    <Button
      size="lg"
      class="w-full h-12 text-base font-medium rounded-xl"
      @click="handleGenerate"
    >
      <SparklesIcon class="size-5 mr-2" />
      点击AI生成海报
    </Button>
  </div>
</template>
