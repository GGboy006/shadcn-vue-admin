<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { reactiveOmit } from '@vueuse/core'
import { StickToBottom } from 'vue-stick-to-bottom'

import { cn } from '@/lib/utils'

interface Props {
  ariaLabel?: string
  class?: HTMLAttributes['class']
  initial?: boolean | 'instant' | { damping?: number, stiffness?: number, mass?: number }
  resize?: 'instant' | { damping?: number, stiffness?: number, mass?: number }
  damping?: number
  stiffness?: number
  mass?: number
  anchor?: 'auto' | 'none'
}

const props = withDefaults(defineProps<Props>(), {
  ariaLabel: '消息列表',
  initial: true,
  damping: 0.7,
  stiffness: 0.05,
  mass: 1.25,
  anchor: 'none',
})
const delegatedProps = reactiveOmit(props, 'class', 'ariaLabel')
</script>

<template>
  <StickToBottom
    v-bind="delegatedProps"
    :aria-label="props.ariaLabel"
    :class="cn('relative min-h-0 flex-1 overflow-y-hidden', props.class)"
    role="log"
  >
    <slot />
    <template #overlay>
      <slot name="overlay" />
    </template>
    <template #after>
      <slot name="after" />
    </template>
  </StickToBottom>
</template>
