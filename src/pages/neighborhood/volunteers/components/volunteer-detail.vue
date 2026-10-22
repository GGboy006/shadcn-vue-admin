<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { VolunteerLogSave } from '@/services/api/neighborhood-resident.api'

import { DatePicker } from '@/components/prop-ui/date-picker'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useCreateVolunteerLogMutation, useGetVolunteerDetailQuery } from '@/services/api/neighborhood-resident.api'
import { optionalNumber } from '@/validators/common'

const props = defineProps<{ volunteerId: string }>()
const { data, isLoading } = useGetVolunteerDetailQuery(() => props.volunteerId)
const detail = computed(() => data.value?.data)
const logs = computed(() => detail.value?.logs ?? [])

const { handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(z.object({
    name: z.string().trim().min(1, '请填写事项'),
    signDate: z.string().trim().min(1, '请选择日期'),
    hours: optionalNumber.refine((value): value is number => typeof value === 'number' && value > 0, '请填写大于 0 的时长'),
  })),
  initialValues: { name: '', signDate: '', hours: undefined },
})

const { mutate, isPending } = useCreateVolunteerLogMutation()

const onSubmit = handleSubmit((form) => {
  const payload: VolunteerLogSave = {
    volunteerId: props.volunteerId,
    name: form.name.trim(),
    signDate: form.signDate,
    hours: form.hours,
  }
  mutate(payload, {
    onSuccess: () => {
      toast.success('已记下时长')
      resetForm({ values: { name: '', signDate: '', hours: undefined } })
    },
    onError: (err: Error) => toast.error(err.message || '保存失败'),
  })
}, (ctx) => {
  const message = Object.values(ctx.errors)[0]
  if (message)
    toast.error(String(message))
})

function text(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '')
    return '-'
  return String(value)
}
</script>

<template>
  <div v-if="isLoading" class="space-y-3">
    <Skeleton class="h-8 w-40" />
    <Skeleton class="h-32 w-full" />
  </div>
  <div v-else-if="detail" class="space-y-6">
    <dl class="grid gap-3 text-sm sm:grid-cols-2">
      <div>
        <dt class="text-muted-foreground">
          姓名
        </dt>
        <dd>{{ text(detail.userName) }}</dd>
      </div>
      <div>
        <dt class="text-muted-foreground">
          电话
        </dt>
        <dd>{{ text(detail.userPhone) }}</dd>
      </div>
      <div>
        <dt class="text-muted-foreground">
          状态
        </dt>
        <dd>{{ text(detail.statusLabel) }}</dd>
      </div>
      <div>
        <dt class="text-muted-foreground">
          累计时长
        </dt>
        <dd class="tabular-nums">
          {{ text(detail.hours) }}
        </dd>
      </div>
      <div>
        <dt class="text-muted-foreground">
          服务时间
        </dt>
        <dd>{{ text(detail.businessHours) }}</dd>
      </div>
      <div class="sm:col-span-2">
        <dt class="text-muted-foreground">
          简介
        </dt>
        <dd class="whitespace-pre-wrap">
          {{ text(detail.intro) }}
        </dd>
      </div>
    </dl>

    <section class="space-y-3">
      <h3 class="text-sm font-medium">
        时长记录
      </h3>
      <p v-if="!logs.length" class="text-sm text-muted-foreground">
        还没有时长记录
      </p>
      <ul v-else class="space-y-2 text-sm">
        <li v-for="log in logs" :key="log.logId" class="flex justify-between gap-3">
          <span>{{ log.signDate }} · {{ log.name }}</span>
          <span class="tabular-nums">{{ log.hours }} 小时</span>
        </li>
      </ul>
    </section>

    <form v-if="detail.status === 2" class="space-y-4 border-t pt-4" @submit="onSubmit">
      <FormField v-slot="{ componentField }" name="name">
        <FormItem>
          <FormLabel required>
            事项
          </FormLabel>
          <FormControl><Input placeholder="如：月末清洁日" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <div class="grid gap-4 sm:grid-cols-2">
        <FormField v-slot="{ componentField }" name="signDate">
          <FormItem>
            <FormLabel required>
              日期
            </FormLabel>
            <FormControl><DatePicker placeholder="选择日期" v-bind="componentField" /></FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="hours">
          <FormItem>
            <FormLabel required>
              时长（小时）
            </FormLabel>
            <FormControl><Input type="number" min="0.1" step="0.1" v-bind="componentField" /></FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
      <Button type="submit" class="w-full" :disabled="isPending">
        {{ isPending ? '保存中...' : '记时长' }}
      </Button>
    </form>
    <p v-else class="text-xs text-muted-foreground">
      只有状态为正常的志愿者可以记时长。
    </p>
  </div>
  <p v-else class="text-sm text-muted-foreground">
    没有读到这位志愿者
  </p>
</template>
