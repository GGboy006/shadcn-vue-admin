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
  throw new Error("TimelineIndicator must be used within a Timeline")
</script>

<template>
  <div
    aria-hidden="true"
    data-slot="timeline-indicator"
    :class="cn(
      'absolute size-4 rounded-full border-2 border-primary/20 group-data-completed/timeline-item:border-primary group-data-completed/timeline-item:bg-primary',
      context.orientation.value === 'vertical'
        ? 'top-0 -left-6 -translate-x-1/2'
        : 'left-0 -top-6 -translate-y-1/2',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
