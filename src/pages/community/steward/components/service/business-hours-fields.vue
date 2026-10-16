<script setup lang="ts">
import { ErrorMessage } from 'vee-validate'

import { TimeRangePicker } from '@/components/prop-ui/date-picker'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { formatOpenDays, parseOpenDays, WEEKDAY_OPTIONS } from '@/services/api/housekeeper-hours'

const EVERY_DAY = '1,2,3,4,5,6,7'
const WEEKDAYS = '1,2,3,4,5'

function asClock(value: unknown) {
  return typeof value === 'string' ? value : undefined
}

function openDaysKey(value: unknown) {
  return formatOpenDays(parseOpenDays(typeof value === 'string' ? value : undefined))
}

function onDaysChange(value: unknown, handleChange: (next: string) => void) {
  const days = Array.isArray(value) ? value.map(item => Number(item)) : []
  handleChange(formatOpenDays(days))
}
</script>

<template>
  <div class="space-y-4">
    <FormField v-slot="{ value: openValue, handleChange: setOpen }" name="openTime">
      <FormItem>
        <FormLabel required>
          营业时间
        </FormLabel>
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
          <FormField v-slot="{ value: closeValue, handleChange: setClose }" name="closeTime">
            <FormControl>
              <div class="w-fit max-w-full shrink-0">
                <TimeRangePicker
                  :start="asClock(openValue)"
                  :end="asClock(closeValue)"
                  @update:start="setOpen"
                  @update:end="setClose"
                />
              </div>
            </FormControl>
          </FormField>
          <p class="min-w-48 flex-1 text-xs leading-5 text-muted-foreground">
            居民端按这个窗口切 60 分钟预约档。结束须晚于开始，至少 1 小时。
          </p>
        </div>
        <ErrorMessage name="openTime" class="text-sm text-destructive" />
        <ErrorMessage name="closeTime" class="text-sm text-destructive" />
      </FormItem>
    </FormField>

    <FormField v-slot="{ value, handleChange }" name="openDays">
      <FormItem>
        <FormLabel required>
          营业日
        </FormLabel>
        <div class="flex flex-wrap items-center gap-2">
          <ToggleGroup
            type="multiple"
            variant="outline"
            size="sm"
            :spacing="2"
            class="gap-2"
            :model-value="parseOpenDays(value).map(String)"
            @update:model-value="days => onDaysChange(days, handleChange)"
          >
            <ToggleGroupItem
              v-for="day in WEEKDAY_OPTIONS"
              :key="day.value"
              :value="String(day.value)"
              class="data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90 data-[state=on]:hover:text-primary-foreground"
            >
              {{ day.label.slice(1) }}
            </ToggleGroupItem>
          </ToggleGroup>
          <Button
            type="button"
            size="sm"
            :variant="openDaysKey(value) === EVERY_DAY ? 'default' : 'outline'"
            @click="handleChange(EVERY_DAY)"
          >
            每天
          </Button>
          <Button
            type="button"
            size="sm"
            :variant="openDaysKey(value) === WEEKDAYS ? 'default' : 'outline'"
            @click="handleChange(WEEKDAYS)"
          >
            工作日
          </Button>
        </div>
        <FormMessage />
      </FormItem>
    </FormField>
  </div>
</template>
