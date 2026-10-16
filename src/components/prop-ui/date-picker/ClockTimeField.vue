<script setup lang="ts">
import TimePicker from './TimePicker.vue'

const modelValue = defineModel<string>()

function toDate(value?: string) {
  const match = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(value ?? '')
  const date = new Date()
  if (!match) {
    date.setHours(9, 0, 0, 0)
    return date
  }
  date.setHours(Number(match[1]), Number(match[2]), 0, 0)
  return date
}

const clock = computed(() => toDate(modelValue.value))

function onChange(date: Date) {
  const next = new Date(date)
  next.setSeconds(0, 0)
  const formatted = `${String(next.getHours()).padStart(2, '0')}:${String(next.getMinutes()).padStart(2, '0')}:00`
  if (formatted !== modelValue.value)
    modelValue.value = formatted
}
</script>

<template>
  <div class="[&_button]:w-full">
    <TimePicker :value="clock" :time-picker="{ hour: true, minute: true, second: false }" @change="onChange" />
  </div>
</template>
