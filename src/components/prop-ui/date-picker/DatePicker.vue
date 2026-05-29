<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'
import { CalendarIcon } from '@lucide/vue'
import dayjs from 'dayjs'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const props = defineProps<{
  placeholder?: string
}>()

const modelValue = defineModel<string>()

const selectedDate = computed(() => {
  if (!modelValue.value)
    return undefined
  const [year, month, day] = modelValue.value.split('-').map(Number)
  return new CalendarDate(year, month, day)
})

function handleSelect(date: CalendarDate | undefined) {
  if (!date) {
    modelValue.value = undefined
    return
  }
  modelValue.value = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
}

const displayText = computed(() => {
  if (!modelValue.value)
    return props.placeholder || '选择日期'
  return dayjs(modelValue.value).format('YYYY-MM-DD')
})
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        type="button"
        variant="outline"
        :data-empty="!modelValue"
        class="w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
      >
        <CalendarIcon class="mr-2 h-4 w-4" />
        <span>{{ displayText }}</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0" align="start">
      <Calendar
        :model-value="selectedDate"
        @update:model-value="handleSelect"
      />
    </PopoverContent>
  </Popover>
</template>
