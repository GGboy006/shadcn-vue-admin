<script lang="ts" setup>
import type { DialogTitleProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

import { reactiveOmit } from '@vueuse/core'
import { useForwardProps } from 'reka-ui'

import { useFormSheet } from './use-form-sheet'

type Props = DialogTitleProps & { class?: HTMLAttributes['class'] }

const props = defineProps<Props>()

const delegatedProps = reactiveOmit(props, 'class')

const forwardedProps = useForwardProps(delegatedProps)

const { FormSheet } = useFormSheet()
</script>

<template>
  <component
    :is="FormSheet.Title"
    v-bind="forwardedProps"
    :class="props.class"
  >
    <slot />
  </component>
</template>
