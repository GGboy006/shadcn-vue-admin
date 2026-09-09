<script setup lang="ts">
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning'

withDefaults(defineProps<{
  content: string
  isStreaming?: boolean
  duration?: number
}>(), {
  isStreaming: false,
})
</script>

<template>
  <Reasoning
    class="mb-2"
    :is-streaming="isStreaming"
    :duration="duration"
  >
    <ReasoningTrigger class="text-current/70 hover:text-current" />
    <ReasoningContent
      :content="content"
      class="text-current/70"
    />
  </Reasoning>
</template>
