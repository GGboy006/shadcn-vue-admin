<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { PointAccount, PointAdjustSave } from '@/services/api/neighborhood-resident.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAdjustPointMutation } from '@/services/api/neighborhood-resident.api'
import { optionalNumber, optionalString } from '@/validators/common'

const props = defineProps<{ account: PointAccount }>()
const emit = defineEmits<{ close: [] }>()

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(z.object({
    points: optionalNumber.refine((value): value is number => typeof value === 'number' && value !== 0, '请填写不为 0 的分值'),
    remark: optionalString,
  })),
  initialValues: { points: undefined, remark: '' },
})

const { mutate, isPending } = useAdjustPointMutation()

const onSubmit = handleSubmit((form) => {
  const payload: PointAdjustSave = {
    userId: props.account.userId,
    points: form.points,
    remark: form.remark?.trim() || undefined,
  }
  mutate(payload, {
    onSuccess: () => {
      toast.success('已调整积分')
      emit('close')
    },
    onError: (err: Error) => toast.error(err.message || '调整失败'),
  })
}, (ctx) => {
  const message = Object.values(ctx.errors)[0]
  if (message)
    toast.error(String(message))
})
</script>

<template>
  <form class="space-y-4" @submit="onSubmit">
    <p class="text-sm">
      {{ account.userName || '居民' }}，当前余额 <span class="tabular-nums">{{ account.balance }}</span>
    </p>
    <FormField v-slot="{ componentField }" name="points">
      <FormItem>
        <FormLabel required>
          分值
        </FormLabel>
        <FormControl><Input type="number" step="1" placeholder="正数加分，负数减分" v-bind="componentField" /></FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="remark">
      <FormItem>
        <FormLabel>原因</FormLabel>
        <FormControl><Textarea rows="3" v-bind="componentField" /></FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <p class="text-xs text-muted-foreground">
      减分后余额不能小于 0。这里不能新建居民。
    </p>
    <Button type="submit" class="w-full" :disabled="isPending">
      {{ isPending ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
