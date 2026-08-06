<script lang="ts" setup>
import type { HTMLAttributes } from 'vue'

import { useFormSheet } from './use-form-sheet'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const { FormSheet } = useFormSheet()
</script>

<template>
  <component
    :is="FormSheet.Header"
    v-bind="props"
  >
    <slot />
  </component>
</template>
