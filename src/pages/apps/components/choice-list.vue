<script setup lang="ts">
import { CheckIcon } from '@lucide/vue'

import type { IChoiceOption } from '../types/wizard.types'

interface Props {
  options: IChoiceOption[]
  selectedValue?: string | string[] | null
  selectionMode?: 'single' | 'multiple'
}

const props = withDefaults(defineProps<Props>(), {
  selectionMode: 'single',
})

const emit = defineEmits<{
  select: [value: string, option: IChoiceOption]
}>()

function isSelected(value: string): boolean {
  if (props.selectionMode === 'multiple') {
    return Array.isArray(props.selectedValue) && props.selectedValue.includes(value)
  }
  return props.selectedValue === value
}

function handleSelect(option: IChoiceOption) {
  emit('select', option.value, option)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      v-for="option in options"
      :key="option.value"
      class="flex items-center gap-3 cursor-pointer rounded-lg border p-3.5 transition-all duration-200 hover:shadow-sm"
      :class="{
        'border-primary bg-primary/5': isSelected(option.value),
        'border-border bg-card hover:border-primary/50': !isSelected(option.value),
      }"
      @click="handleSelect(option)"
    >
      <!-- 图标（list 布局专用，不支持 preview） -->
      <span v-if="option.icon" class="text-2xl shrink-0">
        {{ option.icon }}
      </span>

      <!-- 内容 -->
      <div class="flex-1 min-w-0">
        <h4 class="font-medium text-sm">
          {{ option.label }}
        </h4>
        <p v-if="option.desc" class="mt-0.5 text-xs text-muted-foreground">
          {{ option.desc }}
        </p>
      </div>

      <!-- 选中标记 -->
      <div
        class="flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors"
        :class="{
          'border-primary bg-primary': isSelected(option.value),
          'border-muted-foreground/30': !isSelected(option.value),
        }"
      >
        <CheckIcon
          v-if="isSelected(option.value)"
          class="size-3 text-primary-foreground"
        />
      </div>
    </div>
  </div>
</template>
