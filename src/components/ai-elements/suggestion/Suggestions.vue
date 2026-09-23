<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div :class="cn('w-full overflow-x-auto', props.class)">
    <div class="flex w-max flex-nowrap items-center gap-2">
      <slot />
    </div>
  </div>
</template>
