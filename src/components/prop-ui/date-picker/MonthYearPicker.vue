<script setup lang="ts">
// 移植自 https://github.com/huybuidac/shadcn-datetime-picker 的 MonthYearPicker(React → Vue)。
// 提供月份九宫格与年份滚动列表,供 DateTimePicker 快速跳转月/年。
import dayjs from 'dayjs'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

const props = defineProps<{
  value: Date
  /** false 时隐藏(由父级控制显隐,保持挂载以便滚动定位) */
  mode: 'month' | 'year' | false
  minDate?: Date
  maxDate?: Date
  class?: string
}>()

const emit = defineEmits<{
  change: [value: Date, mode: 'month' | 'year']
}>()

interface TimeOption {
  value: number
  label: string
  disabled: boolean
}

const selectedYear = computed(() => props.value.getFullYear())
const selectedMonth = computed(() => props.value.getMonth())

const years = computed<TimeOption[]>(() => {
  const list: TimeOption[] = []
  for (let i = 1912; i < 2100; i++) {
    let disabled = false
    const startY = dayjs(props.value).year(i).startOf('year').toDate()
    const endY = dayjs(props.value).year(i).endOf('year').toDate()
    if (props.minDate && endY < props.minDate)
      disabled = true
    if (props.maxDate && startY > props.maxDate)
      disabled = true
    list.push({ value: i, label: String(i), disabled })
  }
  return list
})

const months = computed<TimeOption[]>(() => {
  const list: TimeOption[] = []
  for (let i = 0; i < 12; i++) {
    let disabled = false
    const startM = dayjs(props.value).month(i).startOf('month').toDate()
    const endM = dayjs(props.value).month(i).endOf('month').toDate()
    if (props.minDate && endM < props.minDate)
      disabled = true
    if (props.maxDate && startM > props.maxDate)
      disabled = true
    list.push({ value: i, label: dayjs(new Date(2000, i, 1)).format('MMM'), disabled })
  }
  return list
})

/** 切换年份后,若超出 min/max 边界则把月份夹到边界月。 */
function onYearChange(option: TimeOption) {
  let next = dayjs(props.value).year(option.value)
  if (props.minDate && next.toDate() < props.minDate)
    next = next.month(props.minDate.getMonth())
  if (props.maxDate && next.toDate() > props.maxDate)
    next = next.month(props.maxDate.getMonth())
  emit('change', next.toDate(), 'year')
}

function onMonthChange(option: TimeOption) {
  emit('change', dayjs(props.value).month(option.value).toDate(), 'month')
}

// 年份列表打开时,把当前选中年滚动到视口中间
const yearEl = ref<HTMLElement | null>(null)

function setYearRef(el: unknown, selected: boolean) {
  if (selected)
    yearEl.value = el as HTMLElement
}

watch(
  () => [props.mode, props.value] as const,
  () => {
    if (props.mode === 'year')
      nextTick(() => yearEl.value?.scrollIntoView({ behavior: 'auto', block: 'center' }))
  },
  { immediate: true },
)
</script>

<template>
  <div :class="cn(props.class)">
    <ScrollArea class="h-full">
      <div v-if="mode === 'year'" class="grid grid-cols-4">
        <div
          v-for="year in years"
          :key="year.value"
          :ref="(el) => setYearRef(el, year.value === selectedYear)"
        >
          <Button
            type="button"
            :disabled="year.disabled"
            :variant="selectedYear === year.value ? 'default' : 'ghost'"
            class="rounded-full"
            @click="onYearChange(year)"
          >
            {{ year.label }}
          </Button>
        </div>
      </div>
      <div v-if="mode === 'month'" class="grid grid-cols-3 gap-4">
        <Button
          v-for="month in months"
          :key="month.value"
          type="button"
          size="lg"
          :disabled="month.disabled"
          :variant="selectedMonth === month.value ? 'default' : 'ghost'"
          class="rounded-full"
          @click="onMonthChange(month)"
        >
          {{ month.label }}
        </Button>
      </div>
    </ScrollArea>
  </div>
</template>
