<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { computed } from 'vue'

import { cn } from '@/lib/utils'

interface Props {
  /** user / assistant，以及站长端扩展角色 */
  from: string
  /** 不传则 user 靠右、其余靠左 */
  align?: 'start' | 'end'
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const isUser = computed(() => props.from === 'user')
const alignEnd = computed(() => props.align === 'end' || (props.align == null && isUser.value))
</script>

<template>
  <div
    :class="
      cn(
        'group flex w-full max-w-[80%] gap-2',
        isUser ? 'is-user' : 'is-assistant',
        alignEnd ? 'ml-auto flex-row-reverse' : '',
        props.class,
      )
    "
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
