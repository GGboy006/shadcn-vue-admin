<script setup lang="ts">
import type { IMessagePart, IToolCall } from '@/services/api/conversation.api'

import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool'
import { toAiToolView } from '@/utils/chat-message-parts'

const props = withDefaults(defineProps<{
  part: IMessagePart
  isStreaming?: boolean
  /** 消息级 toolCalls，用于补齐中文展示名 */
  toolCalls?: IToolCall[] | null
}>(), {
  isStreaming: false,
  toolCalls: null,
})

const DYNAMIC_TOOL_TYPE = 'dynamic-tool' as const

const view = computed(() => toAiToolView(props.part, props.isStreaming, props.toolCalls))
</script>

<template>
  <Tool
    v-if="view"
    :default-open="false"
    class="mb-2 overflow-hidden border-current/20 bg-background/85 text-foreground"
  >
    <ToolHeader
      :type="DYNAMIC_TOOL_TYPE"
      :tool-name="view.toolName"
      :state="view.state"
      :title="view.title"
    />
    <ToolContent>
      <ToolInput v-if="view.input !== undefined" :input="view.input" />
      <ToolOutput
        :output="view.output"
        :error-text="view.errorText"
      />
    </ToolContent>
  </Tool>
</template>
