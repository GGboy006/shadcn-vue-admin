<script lang="ts" setup>
import type { DialogContentEmits, DialogContentProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { useForwardPropsEmits } from 'reka-ui'

import { cn } from '@/lib/utils'

import { useFormSheet } from './use-form-sheet'

const props = defineProps<DialogContentProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<DialogContentEmits>()

const { FormSheet, contentProps, contentClass } = useFormSheet()

const forwarded = useForwardPropsEmits(props, emits)

const mergedClass = computed(() => cn(contentClass.value, props.class))
</script>

<template>
  <component
    :is="FormSheet.Content"
    v-bind="{ ...forwarded, ...contentProps }"
    :class="mergedClass"
  >
    <slot />
  </component>
</template>
