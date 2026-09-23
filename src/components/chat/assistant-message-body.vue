<script setup lang="ts">
import { computed } from 'vue'

import type { IChatMessage } from '@/services/api/conversation.api'
import type { FlyCardsAfterText } from '@/utils/feizhu'

import { durationSeconds, getImageGenerationCards, getMessageReasoning, getMessageText } from '@/utils/chat-message-parts'
import { normalizeChatMarkdown } from '@/utils/feizhu'

import AiElementsReasoning from './ai-elements-reasoning.vue'
import AiElementsTool from './ai-elements-tool.vue'
import FlyCards from './fly/fly-cards.vue'
import ImageGenerationCardView from './image-generation-card.vue'
import StreamMarkdownContent from './StreamMarkdownContent.vue'

const props = withDefaults(defineProps<{
  message: IChatMessage
  isStreaming?: boolean
  flyCards?: FlyCardsAfterText | null
}>(), {
  isStreaming: false,
  flyCards: null,
})

const parts = computed(() => props.message.parts ?? [])
const imageCards = computed(() => getImageGenerationCards(props.message))
const hasStructuredParts = computed(() => parts.value.some(part =>
  part.type === 'tool_call' || part.type === 'reasoning' || part.type === 'text',
))
const hasTextPart = computed(() => parts.value.some(part => part.type === 'text' && part.content))

function displayText(content: string): string {
  if (props.isStreaming)
    return content
  return normalizeChatMarkdown(content)
}
</script>

<template>
  <template v-if="hasStructuredParts">
    <template v-for="(part, index) in parts" :key="`${part.type}-${index}`">
      <AiElementsTool
        v-if="part.type === 'tool_call'"
        :part="part"
        :tool-calls="message.toolCalls"
        :is-streaming="isStreaming"
      />
      <AiElementsReasoning
        v-else-if="part.type === 'reasoning' && (part.content || isStreaming)"
        :content="part.content || ''"
        :is-streaming="isStreaming && !getMessageText(message)"
        :duration="durationSeconds(part.duration)"
      />
      <StreamMarkdownContent
        v-else-if="part.type === 'text' && part.content"
        :content="displayText(part.content)"
        :is-streaming="isStreaming"
      />
    </template>
    <StreamMarkdownContent
      v-if="!hasTextPart && getMessageText(message)"
      :content="displayText(getMessageText(message))"
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
      :content="displayText(getMessageText(message))"
      :is-streaming="isStreaming"
    />
  </template>
  <ImageGenerationCardView
    v-for="card in imageCards"
    :key="card.imageGenerationId"
    :card="card"
  />
  <FlyCards :cards="flyCards" />
</template>
