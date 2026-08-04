<script setup lang="ts">
// 移植自 https://github.com/huybuidac/shadcn-datetime-picker(React)的 DateTimePicker。
//
// 与原版差异(为贴合本项目约定):
// - 用 string v-model(默认格式 `YYYY-MM-DD HH:mm:ss`)替代 React 的 Date + onChange,
//   直接对接 vee-validate 表单字段与后端 LocalDateTime。
// - 用本项目已有的 shadcn-vue Calendar(基于 reka-ui / @internationalized/date)替代
//   react-day-picker;JS Date 与 CalendarDate 之间做桥接。
// - 时区参数省略(项目统一走本地时区 + dayjs);trigger 改为具名插槽。
import type { DateValue } from '@internationalized/date'

import { CalendarDate } from '@internationalized/date'
import { CalendarIcon, ChevronDownIcon, ChevronUpIcon, CircleXIcon } from '@lucide/vue'
import dayjs from 'dayjs'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import MonthYearPicker from './MonthYearPicker.vue'
import TimePicker from './TimePicker.vue'

const props = withDefaults(defineProps<{
  /** 值序列化格式,默认对接后端 LocalDateTime */
  valueFormat?: string
  /** 最小可选时间,支持 Date 或可被 dayjs 解析的字符串 */
  min?: Date | string
  max?: Date | string
  disabled?: boolean
  /** 仅选日期,隐藏时间选择 */
  hideTime?: boolean
  /** 12 小时制 + AM/PM */
  use12HourFormat?: boolean
  /** 显示清除按钮 */
  clearable?: boolean
  /** 控制时间选择列 */
  timePicker?: { hour?: boolean, minute?: boolean, second?: boolean }
  placeholder?: string
  /** 是否为模态弹层(置于 Dialog 内时建议开启) */
  modal?: boolean
  triggerClass?: string
}>(), {
  valueFormat: 'YYYY-MM-DD HH:mm:ss',
  modal: false,
})

const modelValue = defineModel<string>()

const open = ref(false)
const monthYearPicker = ref<'month' | 'year' | false>(false)

const minDate = computed(() => (props.min ? dayjs(props.min).toDate() : undefined))
const maxDate = computed(() => (props.max ? dayjs(props.max).toDate() : undefined))

/** 外部字符串值 → JS Date;无值时用当前时间作为初始锚点。 */
const initDate = computed(() => {
  if (modelValue.value)
    return dayjs(modelValue.value).toDate()
  // 无值时用当前时间作锚点,但秒/毫秒清零,避免秒列停在当前真实秒
  return dayjs().second(0).millisecond(0).toDate()
})

// 弹层内的工作副本:date=待确认的完整日期时间,month=日历当前展示月
const date = ref<Date>(initDate.value)
const month = ref<Date>(initDate.value)

// 打开时重置工作副本到当前值
watch(open, (isOpen) => {
  if (isOpen) {
    date.value = initDate.value
    month.value = initDate.value
    monthYearPicker.value = false
  }
})

// ==================== JS Date ↔ CalendarDate 桥接 ====================

function toCalendarDate(d: Date): CalendarDate {
  return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

const selectedCalendarDate = computed(() => toCalendarDate(date.value))
const placeholderDate = computed({
  get: () => toCalendarDate(month.value),
  set: (v: DateValue) => {
    month.value = dayjs(month.value).year(v.year).month(v.month - 1).date(v.day).toDate()
  },
})

// ==================== 交互 ====================

/** 选日期:保留原时间部分,仅换年月日;越界则把时间夹到 min/max。 */
function onDaySelect(value: DateValue | undefined) {
  if (!value)
    return
  let next = dayjs(date.value)
    .year(value.year)
    .month(value.month - 1)
    .date(value.day)
  if (minDate.value && next.toDate() < minDate.value)
    next = dayjs(next).hour(minDate.value.getHours()).minute(minDate.value.getMinutes()).second(minDate.value.getSeconds())
  if (maxDate.value && next.toDate() > maxDate.value)
    next = dayjs(next).hour(maxDate.value.getHours()).minute(maxDate.value.getMinutes()).second(maxDate.value.getSeconds())
  date.value = next.toDate()
}

function onTimeChange(d: Date) {
  date.value = d
}

function onMonthYearChange(d: Date, mode: 'month' | 'year') {
  month.value = d
  monthYearPicker.value = mode === 'year' ? 'month' : false
}

function toggleMonthYear(target: 'month' | 'year') {
  monthYearPicker.value = monthYearPicker.value === target ? false : target
}

function onPrevMonth() {
  month.value = dayjs(month.value).subtract(1, 'month').toDate()
}

function onNextMonth() {
  month.value = dayjs(month.value).add(1, 'month').toDate()
}

function onSubmit() {
  modelValue.value = dayjs(date.value).format(props.valueFormat)
  open.value = false
}

function onClear(e: Event) {
  e.stopPropagation()
  e.preventDefault()
  modelValue.value = undefined
  open.value = false
}

// ==================== 触发器显示 ====================

/**
 * 实际显示的时间格式片段,按 timePicker 精度动态拼接:
 * - hideTime:无时间片段
 * - 未传 timePicker(缺省):HH:mm:ss
 * - 传 timePicker:按 {hour,minute,second} 哪些为 true 拼对应片段
 *   例:{second:false} -> HH:mm;{minute:false,second:false} -> HH
 * 这样传 {second:false} 时触发器不再带 :00 秒,与弹层隐藏秒列保持一致。
 */
const timeFormat = computed(() => {
  if (props.hideTime)
    return ''
  const tp = props.timePicker
  const showHour = !tp || tp.hour
  const showMinute = !tp || tp.minute
  const showSecond = !tp || tp.second
  const parts: string[] = []
  if (showHour)
    parts.push(props.use12HourFormat ? 'hh' : 'HH')
  if (showMinute)
    parts.push('mm')
  if (showSecond)
    parts.push('ss')
  const body = parts.join(':')
  return props.use12HourFormat ? ` ${body} A` : ` ${body}`
})

const displayText = computed(() => {
  if (!modelValue.value)
    return props.placeholder || (props.hideTime ? '选择日期' : '选择日期时间')
  return dayjs(modelValue.value).format(`YYYY-MM-DD${timeFormat.value}`)
})

const monthLabel = computed(() => dayjs(month.value).format('MMMM'))
const yearLabel = computed(() => dayjs(month.value).format('YYYY'))
</script>

<template>
  <Popover v-model:open="open" :modal="modal">
    <PopoverTrigger as-child :disabled="disabled">
      <slot name="trigger" :display-text="displayText" :open="open" :value="modelValue">
        <div
          :class="cn(
            'flex w-full cursor-pointer items-center h-9 ps-3 pe-1 font-normal border border-input rounded-md text-sm shadow-sm',
            !modelValue && 'text-muted-foreground',
            (!clearable || !modelValue) && 'pe-3',
            disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
            triggerClass,
          )"
          tabindex="0"
        >
          <div class="grow flex items-center">
            <CalendarIcon class="mr-2 size-4" />
            {{ displayText }}
          </div>
          <Button
            v-if="clearable && modelValue"
            type="button"
            :disabled="disabled"
            variant="ghost"
            size="sm"
            aria-label="清除"
            class="size-6 p-1 ms-1"
            @click="onClear"
          >
            <CircleXIcon class="size-4" />
          </Button>
        </div>
      </slot>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-2" align="start">
      <!-- 自定义月/年导航头 -->
      <div class="flex items-center justify-between">
        <div class="text-md font-bold ms-2 flex items-center cursor-pointer">
          <div>
            <span @click="toggleMonthYear('month')">{{ monthLabel }}</span>
            <span class="ms-1" @click="toggleMonthYear('year')">{{ yearLabel }}</span>
          </div>
          <Button type="button" variant="ghost" size="icon" @click="monthYearPicker = monthYearPicker ? false : 'year'">
            <ChevronUpIcon v-if="monthYearPicker" />
            <ChevronDownIcon v-else />
          </Button>
        </div>
        <div :class="cn('flex space-x-2', monthYearPicker ? 'hidden' : '')">
          <Button type="button" variant="ghost" size="icon" @click="onPrevMonth">
            <ChevronDownIcon class="rotate-90" />
          </Button>
          <Button type="button" variant="ghost" size="icon" @click="onNextMonth">
            <ChevronDownIcon class="-rotate-90" />
          </Button>
        </div>
      </div>

      <!-- 日历 + 月/年快速选择浮层 -->
      <div class="relative overflow-hidden">
        <Calendar
          v-model:placeholder="placeholderDate"
          :model-value="selectedCalendarDate"
          :min-value="minDate ? toCalendarDate(minDate) : undefined"
          :max-value="maxDate ? toCalendarDate(maxDate) : undefined"
          class="p-0"
          @update:model-value="onDaySelect"
        />
        <div :class="cn('absolute inset-0', monthYearPicker ? 'bg-popover' : 'hidden')" />
        <MonthYearPicker
          :value="month"
          :mode="monthYearPicker"
          :min-date="minDate"
          :max-date="maxDate"
          :class="cn('absolute inset-0', monthYearPicker ? '' : 'hidden')"
          @change="onMonthYearChange"
        />
      </div>

      <!-- 时间 + 确认 -->
      <div class="flex flex-col gap-2 mt-2">
        <TimePicker
          v-if="!hideTime"
          :value="date"
          :use12-hour-format="use12HourFormat"
          :min="minDate"
          :max="maxDate"
          :time-picker="timePicker"
          @change="onTimeChange"
        />
        <div class="flex flex-row-reverse items-center justify-between">
          <Button type="button" class="ms-2 h-7 px-2" @click="onSubmit">
            确定
          </Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
