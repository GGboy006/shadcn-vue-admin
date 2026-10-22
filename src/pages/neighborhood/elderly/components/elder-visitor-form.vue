<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { ElderVisitor, ElderVisitorSave } from '@/services/api/neighborhood-resident.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreateElderVisitorMutation, useUpdateElderVisitorMutation } from '@/services/api/neighborhood-resident.api'
import { optionalContactPhone, optionalInt, optionalString } from '@/validators/common'

const props = defineProps<{ row?: ElderVisitor }>()
const emit = defineEmits<{ close: [] }>()
const isEdit = computed(() => !!props.row?.visitorId)

const schema = z.object({
  name: z.string().trim().min(1, '请填写姓名'),
  phone: optionalContactPhone,
  sortOrder: optionalInt.refine(value => value === undefined || value >= 0, '请填写不小于 0 的整数'),
  remark: optionalString,
})

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    name: props.row?.name ?? '',
    phone: props.row?.phone ?? '',
    sortOrder: props.row?.sortOrder ?? undefined,
    remark: props.row?.remark ?? '',
  },
})

const { mutate: createRow, isPending: isCreating } = useCreateElderVisitorMutation()
const { mutate: updateRow, isPending: isUpdating } = useUpdateElderVisitorMutation()
const isPending = computed(() => isCreating.value || isUpdating.value)

const onSubmit = handleSubmit((form) => {
  const payload: ElderVisitorSave = {
    visitorId: isEdit.value ? props.row?.visitorId : undefined,
    name: form.name.trim(),
    phone: form.phone?.trim() || undefined,
    sortOrder: form.sortOrder,
    remark: form.remark?.trim() || undefined,
  }
  const mutate = isEdit.value ? updateRow : createRow
  mutate(payload, {
    onSuccess: () => {
      toast.success(isEdit.value ? '已更新' : '已新增')
      emit('close')
    },
    onError: (err: Error) => toast.error(err.message || '保存失败'),
  })
}, (ctx) => {
  const message = Object.values(ctx.errors)[0]
  if (message)
    toast.error(String(message))
})
</script>

<template>
  <form class="space-y-4" @submit="onSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
      <FormField v-slot="{ componentField }" name="name">
        <FormItem>
          <FormLabel required>
            姓名
          </FormLabel>
          <FormControl><Input v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="phone">
        <FormItem>
          <FormLabel>电话</FormLabel>
          <FormControl><Input maxlength="20" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="sortOrder">
        <FormItem>
          <FormLabel>排序</FormLabel>
          <FormControl><Input type="number" min="0" step="1" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>
    <FormField v-slot="{ componentField }" name="remark">
      <FormItem>
        <FormLabel>备注</FormLabel>
        <FormControl><Textarea rows="4" v-bind="componentField" /></FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <p class="text-xs text-muted-foreground">
      这份名单和志愿服务不是同一套人。
    </p>
    <Button type="submit" class="w-full" :disabled="isPending">
      {{ isPending ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
