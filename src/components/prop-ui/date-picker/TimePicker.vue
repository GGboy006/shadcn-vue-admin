<script setup lang="ts">
// 移植自 https://github.com/huybuidac/shadcn-datetime-picker 的 TimePicker(React → Vue)。
// 以 Date 为载体,点选后立即回写。日期时间选择器把确认留在外层。
import { ChevronDownIcon, ClockIcon } from '@lucide/vue'
import dayjs from 'dayjs'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import TimeColumns from './TimeColumns.vue'

const props = defineProps<{
  value: Date
  use12HourFormat?: boolean
  min?: Date
  max?: Date
  /** 控制显示哪几列,缺省时三列全显 */
  timePicker?: { hour?: boolean, minute?: boolean, second?: boolean }
}>()

const emit = defineEmits<{
  change: [date: Date]
}>()

const open = ref(false)

const display = computed(() => {
  const arr: string[] = []
  const tp = props.timePicker
  for (const el of ['hour', 'minute', 'second'] as const) {
    if (!tp || tp[el]) {
      if (el === 'hour')
        arr.push(props.use12HourFormat ? 'hh' : 'HH')
      else
        arr.push(el === 'minute' ? 'mm' : 'ss')
    }
  }
  return dayjs(props.value).format(arr.join(':') + (props.use12HourFormat ? ' A' : ''))
})
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button type="button" variant="outline" role="combobox" :aria-expanded="open" class="justify-between">
        <ClockIcon class="mr-2 size-4" />
        {{ display }}
        <ChevronDownIcon class="ml-2 size-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="p-0" side="top">
      <div class="p-2">
        <TimeColumns
          :value="value"
          :use12-hour-format="use12HourFormat"
          :min="min"
          :max="max"
          :time-picker="timePicker"
          @change="emit('change', $event)"
        />
      </div>
    </PopoverContent>
  </Popover>
</template>
