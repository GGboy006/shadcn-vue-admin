<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import dayjs from 'dayjs'

const props = withDefaults(defineProps<{
  format?: string
  showPeriod?: boolean
}>(), {
  format: 'HH:mm:ss',
  showPeriod: true,
})

const now = ref(dayjs())

let timer: ReturnType<typeof setInterval>

onMounted(() => {
  timer = setInterval(() => {
    now.value = dayjs()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})

const timeStr = computed(() => now.value.format(props.format))
const period = computed(() => now.value.format('A'))
</script>

<template>
  <div class="inline-flex flex-col items-center justify-center rounded-2xl bg-primary/10 px-6 py-3">
    <span class="text-4xl font-mono font-semibold tracking-wider text-foreground tabular-nums">
      {{ timeStr }}
    </span>
    <span v-if="showPeriod" class="mt-1 text-xs font-medium text-muted-foreground uppercase">
      {{ period }}
    </span>
  </div>
</template>
