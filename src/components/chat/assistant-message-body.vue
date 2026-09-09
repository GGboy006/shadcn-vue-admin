<script setup lang="ts">
import { computed } from 'vue'

import type { IChatMessage } from '@/services/api/conversation.api'

import { durationSeconds, getMessageReasoning, getMessageText } from '@/utils/chat-message-parts'

import AiElementsReasoning from './ai-elements-reasoning.vue'
import AiElementsTool from './ai-elements-tool.vue'
import StreamMarkdownContent from './StreamMarkdownContent.vue'

const props = withDefaults(defineProps<{
  message: IChatMessage
  isStreaming?: boolean
}>(), {
  isStreaming: false,
})

const parts = computed(() => props.message.parts ?? [])
const hasStructuredParts = computed(() => parts.value.some(part =>
  part.type === 'tool_call' || part.type === 'reasoning' || part.type === 'text',
))
const hasTextPart = computed(() => parts.value.some(part => part.type === 'text' && part.content))
</script>

<template>
  <template v-if="hasStructuredParts">
    <template v-for="(part, index) in parts" :key="`${part.type}-${index}`">
      <AiElementsTool
        v-if="part.type === 'tool_call'"
        :part="part"
        :is-streaming="isStreaming"
      />
      <AiElementsReasoning
        v-else-if="part.type === 'reasoning' && part.content"
        :content="part.content"
        :is-streaming="isStreaming && !getMessageText(message)"
        :duration="durationSeconds(part.duration)"
      />
      <StreamMarkdownContent
        v-else-if="part.type === 'text' && part.content"
        :content="part.content"
        :is-streaming="isStreaming"
      />
    </template>
    <StreamMarkdownContent
      v-if="!hasTextPart && getMessageText(message)"
      :content="getMessageText(message)"
      :is-streaming="isStreaming"
    />
  </template>
  <template v-else>
    <AiElementsReasoning
      v-if="getMessageReasoning(message)"
      :content="getMessageReasoning(message)"
      :is-streaming="isStreaming && !getMessageText(message)"
    />
    <StreamMarkdownContent
      v-if="getMessageText(message)"
      :content="getMessageText(message)"
      :is-streaming="isStreaming"
    />
  </template>
</template>
