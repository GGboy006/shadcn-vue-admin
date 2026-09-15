<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { inject } from "vue"
import { cn } from "@/lib/utils"
import { TIMELINE_INJECTION_KEY } from "./context"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const context = inject(TIMELINE_INJECTION_KEY)
if (!context)
  throw new Error("TimelineSeparator must be used within a Timeline")
</script>

<template>
  <div
    aria-hidden="true"
    data-slot="timeline-separator"
    :class="cn(
      'absolute self-start bg-primary/10 group-last/timeline-item:hidden',
      context.orientation.value === 'vertical'
        ? '-left-6 -translate-x-1/2 h-[calc(100%-1rem-0.25rem)] w-0.5 translate-y-4.5'
        : '-top-6 -translate-y-1/2 h-0.5 w-[calc(100%-1rem-0.25rem)] translate-x-4.5',
      props.class,
    )"
  />
</template>
