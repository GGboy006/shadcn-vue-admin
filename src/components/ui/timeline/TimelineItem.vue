<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed, inject } from "vue"
import { cn } from "@/lib/utils"
import { TIMELINE_INJECTION_KEY } from "./context"

const props = defineProps<{
  step: number
  class?: HTMLAttributes["class"]
}>()

const context = inject(TIMELINE_INJECTION_KEY)
if (!context)
  throw new Error("TimelineItem must be used within a Timeline")

const completed = computed(() => props.step <= context.activeStep.value)
</script>

<template>
  <div
    data-slot="timeline-item"
    :data-completed="completed || undefined"
    :class="cn(
      'group/timeline-item relative flex flex-1 flex-col gap-0.5 has-[+[data-completed]]:**:data-[slot=timeline-separator]:bg-primary',
      context.orientation.value === 'vertical' ? 'ms-8 not-last:pb-6' : 'mt-8 not-last:pe-8',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
