<script setup lang="ts">
import { InfoIcon } from '@lucide/vue'
import { useResizeObserver } from '@vueuse/core'

const props = defineProps<{
  text?: string | null
  /** 占满父级宽度，用于表头说明；默认按表格单元格宽度截断 */
  block?: boolean
}>()

const value = computed(() => props.text?.trim() ?? '')
const textEl = ref<HTMLElement>()
const overflowed = ref(false)

function measure() {
  const el = textEl.value
  overflowed.value = !!el && el.scrollWidth > el.clientWidth + 1
}

useResizeObserver(textEl, measure)
watch(value, () => nextTick(measure))
</script>

<template>
  <span v-if="!value" class="text-sm text-muted-foreground">-</span>
  <span
    v-else
    class="items-center gap-0.5"
    :class="block ? 'flex w-full min-w-0' : 'inline-flex w-36 max-w-36 align-middle'"
  >
    <span
      ref="textEl"
      class="min-w-0 flex-1 truncate text-muted-foreground"
      :class="block ? 'text-xs' : 'text-sm'"
    >{{ value }}</span>
    <UiPopover v-if="overflowed">
      <UiPopoverTrigger as-child>
        <UiButton
          variant="ghost"
          size="icon"
          class="size-6 shrink-0 text-muted-foreground"
          type="button"
        >
          <InfoIcon class="size-3.5" />
          <span class="sr-only">查看完整</span>
        </UiButton>
      </UiPopoverTrigger>
      <UiPopoverContent class="max-h-60 w-80 overflow-y-auto p-3 text-sm leading-relaxed break-words whitespace-pre-wrap" align="start">
        {{ value }}
      </UiPopoverContent>
    </UiPopover>
  </span>
</template>
