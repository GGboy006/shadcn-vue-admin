<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { Collapsible } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

type ToolProps = InstanceType<typeof Collapsible>['$props']

interface Props extends /* @vue-ignore */ ToolProps {
  class?: HTMLAttributes['class']
}

defineOptions({ inheritAttrs: false })

const props = defineProps<Props>()
</script>

<template>
  <Collapsible
    v-bind="{ ...props, ...$attrs, class: cn('group not-prose mb-4 w-full min-w-0 max-w-full overflow-hidden rounded-md border', props.class) }"
  >
    <slot />
  </Collapsible>
</template>
