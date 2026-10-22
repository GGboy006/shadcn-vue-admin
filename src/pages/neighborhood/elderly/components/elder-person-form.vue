<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { ElderPerson, ElderPersonSave } from '@/services/api/neighborhood-resident.api'

import { DatePicker } from '@/components/prop-ui/date-picker'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateElderPersonMutation, useUpdateElderPersonMutation } from '@/services/api/neighborhood-resident.api'
import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

const props = defineProps<{ row?: ElderPerson }>()
const emit = defineEmits<{ close: [] }>()
const isEdit = computed(() => !!props.row?.personId)

const statusOptions = [
  { value: 1, label: '正常' },
  { value: 2, label: '停用' },
] as const

const schema = z.object({
  name: z.string().trim().min(1, '请填写姓名'),
  age: optionalInt.refine(value => value === undefined || value >= 0, '请填写不小于 0 的整数'),
  signDate: optionalString,
  status: optionalNumber,
})

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    name: props.row?.name ?? '',
    age: props.row?.age ?? undefined,
    signDate: props.row?.signDate ?? '',
    status: props.row?.status ?? 1,
  },
})

const { mutate: createRow, isPending: isCreating } = useCreateElderPersonMutation()
const { mutate: updateRow, isPending: isUpdating } = useUpdateElderPersonMutation()
const isPending = computed(() => isCreating.value || isUpdating.value)

const onSubmit = handleSubmit((form) => {
  const payload: ElderPersonSave = {
    personId: isEdit.value ? props.row?.personId : undefined,
    name: form.name.trim(),
    age: form.age,
    signDate: form.signDate?.trim() || undefined,
    status: form.status === 1 || form.status === 2 ? form.status : 1,
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
      <FormField v-slot="{ componentField }" name="age">
        <FormItem>
          <FormLabel>年龄</FormLabel>
          <FormControl><Input type="number" min="0" step="1" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="signDate">
        <FormItem>
          <FormLabel>登记日期</FormLabel>
          <FormControl><DatePicker placeholder="选择日期" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="status">
        <FormItem>
          <FormLabel>状态</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem v-for="item in statusOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>
    <Button type="submit" class="w-full" :disabled="isPending">
      {{ isPending ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
