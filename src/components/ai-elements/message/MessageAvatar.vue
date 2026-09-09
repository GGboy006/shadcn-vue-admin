<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { computed } from 'vue'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface Props {
  src?: string
  name?: string
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const fallbackText = computed(() => props.name?.slice(0, 2) ?? 'ME')
</script>

<template>
  <Avatar :class="cn('mt-1 size-8 shrink-0', props.class)">
    <AvatarImage v-if="props.src" :src="props.src" :alt="props.name" />
    <AvatarFallback>{{ fallbackText }}</AvatarFallback>
  </Avatar>
</template>
