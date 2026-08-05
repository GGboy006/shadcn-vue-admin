<script lang="ts" setup>
import { Button } from '@/components/ui/button'

const props = defineProps<{
  /** 是否激活(选中态) */
  active?: boolean
  /** 无障碍标签 */
  label: string
  /** 禁用 */
  disabled?: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <Button
    type="button"
    variant="ghost"
    size="sm"
    class="size-8 p-0"
    :class="props.active && !props.disabled ? 'bg-accent text-accent-foreground' : ''"
    :aria-label="label"
    :aria-pressed="props.active"
    :disabled="props.disabled"
    @click="$emit('click')"
  >
    <slot />
  </Button>
</template>
