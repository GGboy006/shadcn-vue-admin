<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed, provide, ref } from "vue"
import { cn } from "@/lib/utils"
import { TIMELINE_INJECTION_KEY } from "./context"

const props = withDefaults(defineProps<{
  defaultValue?: number
  value?: number
  orientation?: "horizontal" | "vertical"
  class?: HTMLAttributes["class"]
}>(), {
  defaultValue: 1,
  orientation: "vertical",
})

const emit = defineEmits<{
  "update:value": [value: number]
}>()

const internalStep = ref(props.defaultValue)
const activeStep = computed(() => props.value ?? internalStep.value)
const orientation = computed(() => props.orientation)

function setActiveStep(step: number) {
  if (props.value === undefined)
    internalStep.value = step
  emit("update:value", step)
}

provide(TIMELINE_INJECTION_KEY, {
  activeStep,
  setActiveStep,
  orientation,
})
</script>

<template>
  <div
    data-slot="timeline"
    :data-orientation="orientation"
    :class="cn(
      'group/timeline flex',
      orientation === 'horizontal' ? 'w-full flex-row' : 'flex-col',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
