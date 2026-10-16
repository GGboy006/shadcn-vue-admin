<script setup lang="ts">
// 一天内的开始/结束钟点。弹层里改的是草稿，点确定才同时写回两个值。
import { CircleXIcon, ClockIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import TimeColumns from './TimeColumns.vue'

const props = withDefaults(defineProps<{
  start?: string
  end?: string
  startPlaceholder?: string
  endPlaceholder?: string
  separator?: string
  disabled?: boolean
  clearable?: boolean
}>(), {
  startPlaceholder: '开始时间',
  endPlaceholder: '结束时间',
  separator: '至',
  clearable: true,
})

const emit = defineEmits<{
  'update:start': [value: string | undefined]
  'update:end': [value: string | undefined]
}>()

const columns = { hour: true, minute: true, second: false }
const open = ref(false)
const draftStart = ref(new Date())
const draftEnd = ref(new Date())

function clockToDate(value: string | undefined, fallbackHour: number) {
  const date = new Date()
  const match = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(value ?? '')
  if (!match) {
    date.setHours(fallbackHour, 0, 0, 0)
    return date
  }
  date.setHours(Number(match[1]), Number(match[2]), 0, 0)
  return date
}

function dateToClock(date: Date) {
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${hour}:${minute}:00`
}

function clockLabel(value?: string) {
  const match = /^(\d{2}):(\d{2})/.exec(value ?? '')
  return match ? `${match[1]}:${match[2]}` : ''
}

watch(open, (isOpen) => {
  if (!isOpen)
    return
  draftStart.value = clockToDate(props.start, 9)
  draftEnd.value = clockToDate(props.end, 18)
})

function onConfirm() {
  emit('update:start', dateToClock(draftStart.value))
  emit('update:end', dateToClock(draftEnd.value))
  open.value = false
}

function onCancel() {
  open.value = false
}

function onClear(event: Event) {
  event.stopPropagation()
  event.preventDefault()
  emit('update:start', undefined)
  emit('update:end', undefined)
  open.value = false
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child :disabled="disabled">
      <div
        :class="cn(
          'flex h-9 w-fit cursor-pointer items-center gap-2 rounded-md border border-input px-3 text-sm shadow-sm',
          disabled && 'pointer-events-none cursor-not-allowed opacity-50',
        )"
        tabindex="0"
      >
        <ClockIcon class="size-4 shrink-0 text-muted-foreground" />
        <span :class="cn('tabular-nums', !clockLabel(start) && 'text-muted-foreground')">
          {{ clockLabel(start) || startPlaceholder }}
        </span>
        <span class="text-muted-foreground">{{ separator }}</span>
        <span :class="cn('tabular-nums', !clockLabel(end) && 'text-muted-foreground')">
          {{ clockLabel(end) || endPlaceholder }}
        </span>
        <Button
          v-if="clearable && (start || end)"
          type="button"
          variant="ghost"
          size="sm"
          aria-label="清除"
          class="size-6 p-1"
          :disabled="disabled"
          @click="onClear"
        >
          <CircleXIcon class="size-4" />
        </Button>
      </div>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0" align="start">
      <div class="flex divide-x">
        <div class="w-48 p-2">
          <div class="mb-1 text-center text-sm font-medium">
            开始时间
          </div>
          <!-- 关闭动画结束前保持列高度，否则弹层变矮后会被重新放到下边 -->
          <TimeColumns
            :value="draftStart"
            :time-picker="columns"
            @change="draftStart = $event"
          />
        </div>
        <div class="w-48 p-2">
          <div class="mb-1 text-center text-sm font-medium">
            结束时间
          </div>
          <TimeColumns
            :value="draftEnd"
            :min="draftStart"
            :time-picker="columns"
            @change="draftEnd = $event"
          />
        </div>
      </div>
      <div class="flex items-center justify-end gap-2 border-t px-2 py-2">
        <Button type="button" variant="ghost" size="sm" @click="onCancel">
          取消
        </Button>
        <Button type="button" size="sm" @click="onConfirm">
          确定
        </Button>
      </div>
    </PopoverContent>
  </Popover>
</template>
