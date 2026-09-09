<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import type { ButtonVariants } from '@/components/ui/button'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface Props {
  tooltip?: string
  label?: string
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<Props>(), {
  variant: 'ghost',
  size: 'icon-sm',
})

const buttonProps = {
  variant: props.variant,
  size: props.size,
  type: 'button' as const,
}
</script>

<template>
  <TooltipProvider v-if="props.tooltip">
    <Tooltip>
      <TooltipTrigger as-child>
        <Button v-bind="{ ...buttonProps, ...$attrs }" :class="props.class">
          <slot />
          <span class="sr-only">
            {{ props.label || props.tooltip }}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{{ props.tooltip }}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>

  <Button v-else v-bind="{ ...buttonProps, ...$attrs }" :class="props.class">
    <slot />
    <span class="sr-only">{{ props.label || props.tooltip }}</span>
  </Button>
</template>
