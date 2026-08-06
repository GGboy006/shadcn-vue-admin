<script lang="ts" setup>
import type { DialogCloseProps } from 'reka-ui'

import { useFormSheet } from './use-form-sheet'

const props = defineProps<DialogCloseProps>()

const { FormSheet } = useFormSheet()
</script>

<template>
  <component
    :is="FormSheet.Close"
    v-bind="props"
  >
    <slot />
  </component>
</template>
