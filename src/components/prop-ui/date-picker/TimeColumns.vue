<script setup lang="ts">
// TimePicker 的时/分/秒滚动列。不带弹层，供单时间选择和范围选择共用。
import { CheckIcon } from '@lucide/vue'
import dayjs from 'dayjs'

import { Button } from '@/components/ui/button'
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

const ampm = ref(dayjs(props.value).format('A') === 'AM' ? AM_VALUE : PM_VALUE)
const hour = ref(props.use12HourFormat ? Number(dayjs(props.value).format('hh')) : props.value.getHours())
const minute = ref(props.value.getMinutes())
const second = ref(props.value.getSeconds())

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

const hourRef = ref<HTMLElement | null>(null)
const minuteRef = ref<HTMLElement | null>(null)
const secondRef = ref<HTMLElement | null>(null)

onMounted(() => {
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
  <div class="flex h-56 grow">
    <ScrollArea v-if="!timePicker || timePicker.hour" class="h-full flex-grow">
      <div class="flex grow flex-col items-stretch overflow-y-auto pe-2 pb-48">
        <div v-for="v in hours" :key="v.value" :ref="(el) => { if (v.value === hour) hourRef = el as HTMLElement }">
          <Button
            type="button"
            variant="ghost"
            class="flex h-8 w-full justify-center px-1 pe-2 ps-1"
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
            class="flex h-8 w-full justify-center px-1 pe-2 ps-1"
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
            class="flex h-8 w-full justify-center px-1 pe-2 ps-1"
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
          class="flex h-8 w-full justify-center px-1 pe-2 ps-1"
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
</template>
