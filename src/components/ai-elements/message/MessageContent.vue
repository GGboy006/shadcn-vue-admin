<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <div
    :class="
      cn(
        'is-user:dark flex w-fit max-w-full min-w-0 flex-col gap-2 overflow-hidden rounded-lg px-4 py-3 text-sm',
        'group-[.is-user]:ml-auto group-[.is-user]:bg-neutral-200 group-[.is-user]:text-foreground dark:group-[.is-user]:bg-neutral-800',
        'group-[.is-assistant]:bg-neutral-100 group-[.is-assistant]:text-foreground dark:group-[.is-assistant]:bg-neutral-800',
        props.class,
      )
    "
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
