<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <time
    data-slot="timeline-date"
    :class="cn(
      'mb-1 block font-medium text-muted-foreground text-xs tabular-nums',
      props.class,
    )"
  >
    <slot />
  </time>
</template>
