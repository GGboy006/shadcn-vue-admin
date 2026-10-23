<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { ElderVisit, ElderVisitSave } from '@/services/api/neighborhood-resident.api'

import { DatePicker } from '@/components/prop-ui/date-picker'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateElderVisitMutation, useUpdateElderVisitMutation } from '@/services/api/neighborhood-resident.api'
import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

const props = defineProps<{ row?: ElderVisit }>()
const emit = defineEmits<{ close: [] }>()
const isEdit = computed(() => !!props.row?.visitId)

const typeOptions = [
  { value: 1, label: '每周一次' },
  { value: 2, label: '每周两次' },
  { value: 3, label: '每两周一次' },
  { value: 4, label: '每月一次' },
] as const

const statusOptions = [
  { value: 1, label: '正常' },
  { value: 2, label: '重点关注' },
] as const

const schema = z.object({
  name: z.string().trim().min(1, '请填写姓名'),
  type: optionalNumber.refine((value): value is number => value === 1 || value === 2 || value === 3 || value === 4, '请选择频次'),
  age: optionalInt.refine(value => value === undefined || value >= 0, '请填写不小于 0 的整数'),
  address: optionalString,
  contactName: optionalString,
  signDate: optionalString,
  status: optionalNumber,
})

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    name: props.row?.name ?? '',
    type: props.row?.type ?? 1,
    age: props.row?.age ?? undefined,
    address: props.row?.address ?? '',
    contactName: props.row?.contactName ?? '',
    signDate: props.row?.signDate ?? '',
    status: props.row?.status ?? 1,
  },
})

const { mutate: createRow, isPending: isCreating } = useCreateElderVisitMutation()
const { mutate: updateRow, isPending: isUpdating } = useUpdateElderVisitMutation()
const isPending = computed(() => isCreating.value || isUpdating.value)

const onSubmit = handleSubmit((form) => {
  const payload: ElderVisitSave = {
    visitId: isEdit.value ? props.row?.visitId : undefined,
    name: form.name.trim(),
    type: form.type === 1 || form.type === 2 || form.type === 3 || form.type === 4 ? form.type : 1,
    age: form.age,
    address: form.address?.trim() || undefined,
    contactName: form.contactName?.trim() || undefined,
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
      <FormField v-slot="{ componentField }" name="type">
        <FormItem>
          <FormLabel required>
            频次
          </FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem v-for="item in typeOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </SelectItem>
            </SelectContent>
          </Select>
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
      <FormField v-slot="{ componentField }" name="address">
        <FormItem>
          <FormLabel>地址</FormLabel>
          <FormControl><Input v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="contactName">
        <FormItem>
          <FormLabel>结对志愿者</FormLabel>
          <FormControl><Input v-bind="componentField" /></FormControl>
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
    <p class="text-xs text-muted-foreground">
      居民端只看人数，看不到这份名单。
    </p>
    <Button type="submit" class="w-full" :disabled="isPending">
      {{ isPending ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
