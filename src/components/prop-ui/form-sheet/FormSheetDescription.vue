<script lang="ts" setup>
import type { DialogDescriptionProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { reactiveOmit } from '@vueuse/core'
import { useForwardProps } from 'reka-ui'

import { useFormSheet } from './use-form-sheet'

type Props = DialogDescriptionProps & { class?: HTMLAttributes['class'] }

const props = defineProps<Props>()

const delegatedProps = reactiveOmit(props, 'class')

const forwardedProps = useForwardProps(delegatedProps)

const { FormSheet } = useFormSheet()
</script>

<template>
  <component
    :is="FormSheet.Description"
    v-bind="forwardedProps"
    :class="props.class"
  >
    <slot />
  </component>
</template>
