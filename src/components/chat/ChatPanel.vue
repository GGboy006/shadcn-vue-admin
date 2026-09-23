<script setup lang="ts">
import type { IChatMessage } from '@/services/api/conversation.api'

import { PromptInput } from '@/components/ai-elements/prompt-input'
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion'

import ChatMessageList from './ChatMessageList.vue'

const props = withDefaults(defineProps<{
  messages: IChatMessage[]
  input?: string
  placeholder?: string
  emptyText?: string
  userPosition?: 'left' | 'right'
  showSteps?: boolean
  showRegenerate?: boolean
  showDate?: boolean
  streaming?: boolean
  inputDisabled?: boolean
  attachment?: boolean
  canSubmitExtra?: boolean
  suggestions?: string[]
}>(), {
  input: '',
  placeholder: '输入消息...',
  emptyText: '暂无消息',
  userPosition: 'right',
  showSteps: false,
  showRegenerate: false,
  showDate: false,
  streaming: false,
  inputDisabled: false,
  attachment: false,
  canSubmitExtra: false,
  suggestions: () => [],
})

const emit = defineEmits<{
  'update:input': [value: string]
  'submit': []
  'stop': []
  'regenerate': [msg: IChatMessage]
  'pickAttachments': []
  'selectSuggestion': [question: string]
}>()

const inputText = computed({
  get: () => props.input,
  set: (value: string) => emit('update:input', value),
})
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
    <ChatMessageList
      :messages="messages"
      :user-position="userPosition"
      :show-steps="showSteps"
      :show-regenerate="showRegenerate"
      :show-date="showDate"
      :streaming="streaming"
      :empty-text="emptyText"
      @regenerate="emit('regenerate', $event)"
    >
      <template v-if="$slots.header" #header>
        <slot name="header" />
      </template>
    </ChatMessageList>

    <div class="shrink-0 border-t bg-background p-3 sm:p-4">
      <Suggestions v-if="suggestions.length" class="mb-2">
        <Suggestion
          v-for="question in suggestions"
          :key="question"
          :suggestion="question"
          @select="emit('selectSuggestion', $event)"
        />
      </Suggestions>
      <slot name="composer" />
      <PromptInput
        v-model="inputText"
        :placeholder="placeholder"
        :disabled="inputDisabled"
        :attachment="attachment"
        :can-submit-extra="canSubmitExtra"
        :status="streaming ? 'streaming' : 'ready'"
        @submit="emit('submit')"
        @stop="emit('stop')"
        @pick-attachments="emit('pickAttachments')"
      >
        <template v-if="$slots['input-header']" #header>
          <slot name="input-header" />
        </template>
      </PromptInput>
    </div>
  </div>
</template>
