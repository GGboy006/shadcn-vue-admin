<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const props = defineProps<{
  suggestion: string
  class?: HTMLAttributes['class']
}>()

const emit = defineEmits<{
  select: [suggestion: string]
}>()
</script>

<template>
  <Button
    type="button"
    variant="outline"
    size="sm"
    :class="cn('shrink-0 rounded-full px-4', props.class)"
    @click="emit('select', suggestion)"
  >
    <slot>{{ suggestion }}</slot>
  </Button>
</template>
