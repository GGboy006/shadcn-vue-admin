<script setup lang="ts">
import type { DynamicToolUIPart, ToolUIPart } from 'ai'
import type { HTMLAttributes } from 'vue'

import { ChevronDownIcon, WrenchIcon } from '@lucide/vue'
import { computed } from 'vue'

import { CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

import StatusBadge from './ToolStatusBadge.vue'

type ToolHeaderProps = {
  title?: string
  class?: HTMLAttributes['class']
} & (
  | { type: ToolUIPart['type'], state: ToolUIPart['state'], toolName?: never }
  | { type: DynamicToolUIPart['type'], state: DynamicToolUIPart['state'], toolName: string }
)

const props = defineProps<ToolHeaderProps>()

const derivedName = computed(() =>
  props.type === 'dynamic-tool'
    ? props.toolName
    : props.type.split('-').slice(1).join('-'),
)
</script>

<template>
  <CollapsibleTrigger
    :class="
      cn(
        'flex w-full items-center justify-between gap-4 p-3',
        props.class,
      )
    "
    v-bind="$attrs"
  >
    <div class="flex min-w-0 items-center gap-2">
      <WrenchIcon class="size-4 shrink-0 text-muted-foreground" />
      <span class="min-w-0 truncate font-medium text-sm">{{ props.title ?? derivedName }}</span>
      <StatusBadge :state="props.state" />
    </div>
    <ChevronDownIcon
      class="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
    />
  </CollapsibleTrigger>
</template>
