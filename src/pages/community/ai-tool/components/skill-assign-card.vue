<script setup lang="ts">
import {
  BarChart3Icon,
  CheckIcon,
  FileTextIcon,
  ImageIcon,
  LayersIcon,
  MicIcon,
  XIcon,
} from '@lucide/vue'

import type { IResidentAiToolAssignSkill } from '@/services/api/resident-ai-tool.api'

import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { skillAssignStatusConfig, skillInputTypeConfig } from '@/services/api/skill.api'

const props = defineProps<{
  skill: IResidentAiToolAssignSkill
  /** 本地编辑态是否选中(与后端 skill.checked 区分) */
  selected: boolean
}>()

defineEmits<{
  (e: 'toggle'): void
}>()

/** 无 icon URL 或图片加载失败时,回退到 inputType 对应的 lucide 图标 */
const inputTypeIconMap: Record<number, any> = {
  1: FileTextIcon,
  2: ImageIcon,
  3: MicIcon,
  4: BarChart3Icon,
}

/** 工具形态映射(skill.api 未提供 config,此处局部定义) */
const toolModeLabelMap: Record<number, string> = {
  1: '单次对话',
  2: '流程式向导',
}

const isIconBroken = ref(false)

const fallbackIcon = computed(() => {
  const type = props.skill.inputType
  return (type !== undefined && inputTypeIconMap[type]) || LayersIcon
})

const inputTypeConfig = computed(() => {
  const type = props.skill.inputType
  return type === undefined ? undefined : skillInputTypeConfig[type]
})

const iconBgClass = computed(() =>
  inputTypeConfig.value?.iconBg
  || 'bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-400',
)

const badgeClass = computed(() =>
  inputTypeConfig.value?.badge
  || 'bg-muted text-muted-foreground border-border',
)

const assignStatusConfig = computed(() => {
  const status = props.skill.assignStatus
  return status === undefined ? undefined : skillAssignStatusConfig[status]
})

const toolModeLabel = computed(() => {
  const mode = props.skill.toolMode
  return mode === undefined ? undefined : toolModeLabelMap[mode]
})
</script>

<template>
  <Card
    class="cursor-pointer transition-all duration-200 hover:shadow-md p-2"
    :class="[
      selected
        ? 'ring-2 ring-primary border-primary bg-primary/5'
        : 'border-border hover:border-primary/50',
    ]"
    @click="$emit('toggle')"
  >
    <CardContent class="p-2">
      <div class="flex items-center gap-4">
        <Checkbox
          :model-value="selected"
          class="pointer-events-none"
          @click.stop
        />

        <!-- 图标:优先后端 icon URL,失败回退 inputType 图标 -->
        <div
          class="size-12 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
          :class="iconBgClass"
        >
          <img
            v-if="skill.icon && !isIconBroken"
            :src="skill.icon"
            :alt="skill.name"
            class="size-7 object-contain"
            @error="isIconBroken = true"
          >
          <component :is="fallbackIcon" v-else class="size-6" />
        </div>

        <!-- 内容 -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-semibold text-sm">{{ skill.name }}</span>

            <span
              v-if="inputTypeConfig"
              class="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium"
              :class="badgeClass"
            >
              <component :is="fallbackIcon" class="size-3" />
              {{ inputTypeConfig.label }}
            </span>

            <span
              v-if="toolModeLabel"
              class="inline-flex items-center rounded-md border border-border bg-muted/50 px-1.5 py-0.5 text-xs text-muted-foreground"
            >
              {{ toolModeLabel }}
            </span>

            <span
              v-if="assignStatusConfig"
              class="text-xs text-muted-foreground"
            >
              · {{ assignStatusConfig.label }}
            </span>
          </div>

          <p v-if="skill.description" class="text-sm text-muted-foreground mt-1 line-clamp-2">
            {{ skill.description }}
          </p>

          <div v-if="skill.tags && skill.tags.length > 0" class="flex gap-1.5 mt-2 flex-wrap">
            <span
              v-for="tag in skill.tags"
              :key="tag"
              class="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-xs text-muted-foreground"
            >
              <span class="size-1 rounded-full bg-current opacity-50" />
              {{ tag }}
            </span>
          </div>
        </div>

        <!-- 后端当前状态(非本地勾选态),便于看出本次改动 -->
        <div class="shrink-0 flex items-center gap-1 text-sm">
          <template v-if="skill.checked">
            <CheckIcon class="size-4 text-primary" />
            <span class="text-primary font-medium">已配置</span>
          </template>
          <template v-else>
            <XIcon class="size-4 text-muted-foreground" />
            <span class="text-muted-foreground">未配置</span>
          </template>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
