<script setup lang="ts">
// 移植自 https://github.com/huybuidac/shadcn-datetime-picker 的 TimePicker(React → Vue)。
// 以 Date 为载体,分列滚动选择时/分/秒,支持 12 小时制与 AM/PM,并按 min/max 禁用越界项。
import { CheckIcon, ChevronDownIcon, ClockIcon } from '@lucide/vue'
import dayjs from 'dayjs'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'

interface TimeOption {
  value: number
  label: string
  disabled?: boolean
}

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

const AM_VALUE = 0
const PM_VALUE = 1

const open = ref(false)

const ampm = ref(dayjs(props.value).format('A') === 'AM' ? AM_VALUE : PM_VALUE)
const hour = ref(props.use12HourFormat ? Number(dayjs(props.value).format('hh')) : props.value.getHours())
const minute = ref(props.value.getMinutes())
const second = ref(props.value.getSeconds())

// 外部 value 变化时同步内部分量(如日期切换)
watch(
  () => props.value,
  (v) => {
    ampm.value = dayjs(v).format('A') === 'AM' ? AM_VALUE : PM_VALUE
    hour.value = props.use12HourFormat ? Number(dayjs(v).format('hh')) : v.getHours()
    minute.value = v.getMinutes()
    second.value = v.getSeconds()
  },
)

/** 由当前时/分/秒/ampm 结合日期部分构造新的 Date。 */
function buildTime(h: number, m: number, s: number, ap: number): Date {
  let hour24 = h
  if (props.use12HourFormat)
    hour24 = (h % 12) + ap * 12
  return dayjs(props.value).hour(hour24).minute(m).second(s).millisecond(0).toDate()
}

// 任一分量变化即向上抛出新的时间
watch([hour, minute, second, ampm], () => {
  emit('change', buildTime(hour.value, minute.value, second.value, ampm.value))
})

const hour24 = computed(() => (props.use12HourFormat ? (hour.value % 12) + ampm.value * 12 : hour.value))

const hours = computed<TimeOption[]>(() => {
  const len = props.use12HourFormat ? 12 : 24
  return Array.from({ length: len }, (_, i) => {
    let disabled = false
    const hourValue = props.use12HourFormat ? (i === 0 ? 12 : i) : i
    const base = dayjs(props.value).hour(props.use12HourFormat ? i + ampm.value * 12 : i)
    const hStart = base.startOf('hour').toDate()
    const hEnd = base.endOf('hour').toDate()
    if (props.min && hEnd < props.min)
      disabled = true
    if (props.max && hStart > props.max)
      disabled = true
    return { value: hourValue, label: String(hourValue).padStart(2, '0'), disabled }
  })
})

const minutes = computed<TimeOption[]>(() => {
  const anchor = dayjs(props.value).hour(hour24.value)
  return Array.from({ length: 60 }, (_, i) => {
    let disabled = false
    const mStart = anchor.minute(i).startOf('minute').toDate()
    const mEnd = anchor.minute(i).endOf('minute').toDate()
    if (props.min && mEnd < props.min)
      disabled = true
    if (props.max && mStart > props.max)
      disabled = true
    return { value: i, label: String(i).padStart(2, '0'), disabled }
  })
})

const seconds = computed<TimeOption[]>(() => {
  const anchor = dayjs(props.value).hour(hour24.value).minute(minute.value).millisecond(0)
  const min = props.min ? dayjs(props.min).millisecond(0).toDate() : undefined
  const max = props.max ? dayjs(props.max).millisecond(0).toDate() : undefined
  return Array.from({ length: 60 }, (_, i) => {
    let disabled = false
    const sDate = anchor.second(i).toDate()
    if (min && sDate < min)
      disabled = true
    if (max && sDate > max)
      disabled = true
    return { value: i, label: String(i).padStart(2, '0'), disabled }
  })
})

const ampmOptions = computed<TimeOption[]>(() => {
  const startD = dayjs(props.value).startOf('day')
  const endD = dayjs(props.value).endOf('day')
  return [
    { value: AM_VALUE, label: 'AM' },
    { value: PM_VALUE, label: 'PM' },
  ].map((v) => {
    let disabled = false
    const start = startD.add(v.value * 12, 'hour').toDate()
    const end = endD.subtract((1 - v.value) * 12, 'hour').toDate()
    if (props.min && end < props.min)
      disabled = true
    if (props.max && start > props.max)
      disabled = true
    return { ...v, disabled }
  })
})

/** 改小时:若结果越界,把分/秒夹到边界值。 */
function onHourChange(option: TimeOption) {
  if (props.min) {
    const t = buildTime(option.value, minute.value, second.value, ampm.value)
    if (t < props.min) {
      minute.value = props.min.getMinutes()
      second.value = props.min.getSeconds()
    }
  }
  if (props.max) {
    const t = buildTime(option.value, minute.value, second.value, ampm.value)
    if (t > props.max) {
      minute.value = props.max.getMinutes()
      second.value = props.max.getSeconds()
    }
  }
  hour.value = option.value
}

function onMinuteChange(option: TimeOption) {
  if (props.min) {
    const t = buildTime(hour.value, option.value, second.value, ampm.value)
    if (t < props.min)
      second.value = props.min.getSeconds()
  }
  if (props.max) {
    const t = buildTime(hour.value, option.value, second.value, ampm.value)
    if (t > props.max)
      second.value = props.max.getSeconds()
  }
  minute.value = option.value
}

function onSecondChange(option: TimeOption) {
  second.value = option.value
}

function onAmpmChange(option: TimeOption) {
  if (props.min) {
    const t = buildTime(hour.value, minute.value, second.value, option.value)
    if (t < props.min) {
      const minH = props.min.getHours() % 12
      hour.value = minH === 0 ? 12 : minH
      minute.value = props.min.getMinutes()
      second.value = props.min.getSeconds()
    }
  }
  if (props.max) {
    const t = buildTime(hour.value, minute.value, second.value, option.value)
    if (t > props.max) {
      const maxH = props.max.getHours() % 12
      hour.value = maxH === 0 ? 12 : maxH
      minute.value = props.max.getMinutes()
      second.value = props.max.getSeconds()
    }
  }
  ampm.value = option.value
}

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

// 打开时把选中项滚动到可视区
const hourRef = ref<HTMLElement | null>(null)
const minuteRef = ref<HTMLElement | null>(null)
const secondRef = ref<HTMLElement | null>(null)

watch(open, (isOpen) => {
  if (!isOpen)
    return
  nextTick(() => {
    setTimeout(() => {
      hourRef.value?.scrollIntoView({ behavior: 'auto' })
      minuteRef.value?.scrollIntoView({ behavior: 'auto' })
      secondRef.value?.scrollIntoView({ behavior: 'auto' })
    }, 1)
  })
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
      <div class="flex-col gap-2 p-2">
        <div class="flex h-56 grow">
          <ScrollArea v-if="!timePicker || timePicker.hour" class="h-full flex-grow">
            <div class="flex grow flex-col items-stretch overflow-y-auto pe-2 pb-48">
              <div v-for="v in hours" :key="v.value" :ref="(el) => { if (v.value === hour) hourRef = el as HTMLElement }">
                <Button
                  type="button"
                  variant="ghost"
                  class="flex w-full justify-center px-1 pe-2 ps-1 h-8"
                  :disabled="v.disabled"
                  @click="onHourChange(v)"
                >
                  <div class="w-4">
                    <CheckIcon v-if="v.value === hour" class="my-auto size-4" />
                  </div>
                  <span class="ms-2">{{ v.label }}</span>
                </Button>
              </div>
            </div>
          </ScrollArea>
          <ScrollArea v-if="!timePicker || timePicker.minute" class="h-full flex-grow">
            <div class="flex grow flex-col items-stretch overflow-y-auto pe-2 pb-48">
              <div v-for="v in minutes" :key="v.value" :ref="(el) => { if (v.value === minute) minuteRef = el as HTMLElement }">
                <Button
                  type="button"
                  variant="ghost"
                  class="flex w-full justify-center px-1 pe-2 ps-1 h-8"
                  :disabled="v.disabled"
                  @click="onMinuteChange(v)"
                >
                  <div class="w-4">
                    <CheckIcon v-if="v.value === minute" class="my-auto size-4" />
                  </div>
                  <span class="ms-2">{{ v.label }}</span>
                </Button>
              </div>
            </div>
          </ScrollArea>
          <ScrollArea v-if="!timePicker || timePicker.second" class="h-full flex-grow">
            <div class="flex grow flex-col items-stretch overflow-y-auto pe-2 pb-48">
              <div v-for="v in seconds" :key="v.value" :ref="(el) => { if (v.value === second) secondRef = el as HTMLElement }">
                <Button
                  type="button"
                  variant="ghost"
                  class="flex w-full justify-center px-1 pe-2 ps-1 h-8"
                  :disabled="v.disabled"
                  @click="onSecondChange(v)"
                >
                  <div class="w-4">
                    <CheckIcon v-if="v.value === second" class="my-auto size-4" />
                  </div>
                  <span class="ms-2">{{ v.label }}</span>
                </Button>
              </div>
            </div>
          </ScrollArea>
          <ScrollArea v-if="use12HourFormat" class="h-full flex-grow">
            <div class="flex grow flex-col items-stretch overflow-y-auto pe-2">
              <Button
                v-for="v in ampmOptions"
                :key="v.value"
                type="button"
                variant="ghost"
                class="flex w-full justify-center px-1 pe-2 ps-1 h-8"
                :disabled="v.disabled"
                @click="onAmpmChange(v)"
              >
                <div class="w-4">
                  <CheckIcon v-if="v.value === ampm" class="my-auto size-4" />
                </div>
                <span class="ms-2">{{ v.label }}</span>
              </Button>
            </div>
          </ScrollArea>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
