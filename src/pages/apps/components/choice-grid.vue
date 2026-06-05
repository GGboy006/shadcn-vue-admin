<script setup lang="ts">
import { CheckIcon } from '@lucide/vue'

import { ScrollArea } from '@/components/ui/scroll-area'

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
  <ScrollArea class="h-[400px]">
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 pr-3">
      <div
        v-for="option in options"
        :key="option.value"
        class="relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md"
        :class="{
          'border-primary bg-primary/5': isSelected(option.value),
          'border-border bg-card hover:border-primary/50': !isSelected(option.value),
        }"
        @click="handleSelect(option)"
      >
        <!-- 选中标记 -->
        <div
          v-if="isSelected(option.value)"
          class="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary"
        >
          <CheckIcon class="size-3 text-primary-foreground" />
        </div>

        <!-- 预览图（grid 布局专用） -->
        <div v-if="option.preview" class="mb-2 aspect-[4/3] overflow-hidden rounded-lg">
          <img :src="option.preview" :alt="option.label" class="size-full object-cover">
        </div>

        <!-- 图标（grid 布局 fallback） -->
        <div v-else-if="option.icon" class="text-3xl mb-2">
          {{ option.icon }}
        </div>

        <!-- 标签 -->
        <h4 class="font-medium text-sm">
          {{ option.label }}
        </h4>

        <!-- 描述 -->
        <p v-if="option.desc" class="mt-1 text-xs text-muted-foreground">
          {{ option.desc }}
        </p>
      </div>
    </div>
  </ScrollArea>
</template>
