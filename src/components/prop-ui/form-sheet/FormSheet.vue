<script lang="ts" setup>
import type { DialogRootProps } from 'reka-ui'

import { useForwardPropsEmits } from 'reka-ui'

import { useFormSheet } from './use-form-sheet'

const props = defineProps<DialogRootProps>()
const emits = defineEmits<{
  'update:open': [value: boolean]
}>()

const forwarded = useForwardPropsEmits(props, emits)

const { FormSheet } = useFormSheet()
</script>

<template>
  <component
    :is="FormSheet.Root"
    v-bind="forwarded"
  >
    <slot />
  </component>
</template>
