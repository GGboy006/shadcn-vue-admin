<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { HealthSign, HealthSignSave } from '@/services/api/neighborhood-resident.api'

import { DatePicker, DateTimePicker } from '@/components/prop-ui/date-picker'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateHealthSignMutation, useUpdateHealthSignMutation } from '@/services/api/neighborhood-resident.api'
import { optionalContactPhone, optionalNumber, optionalString } from '@/validators/common'

const props = defineProps<{ row?: HealthSign }>()
const emit = defineEmits<{ close: [] }>()
const isEdit = computed(() => !!props.row?.signId)

const statusOptions = [
  { value: 1, label: '已签约' },
  { value: 2, label: '已到期' },
  { value: 3, label: '已解约' },
] as const

const schema = z.object({
  userName: z.string().trim().min(1, '请填写姓名'),
  userId: optionalString,
  userPhone: optionalContactPhone,
  contactName: optionalString,
  title: optionalString,
  signDate: optionalString,
  endTime: optionalString,
  status: optionalNumber,
  intro: optionalString,
})

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    userName: props.row?.userName ?? '',
    userId: props.row?.userId ?? '',
    userPhone: props.row?.userPhone ?? '',
    contactName: props.row?.contactName ?? '',
    title: props.row?.title ?? '',
    signDate: props.row?.signDate ?? '',
    endTime: props.row?.endTime ?? '',
    status: props.row?.status ?? 1,
    intro: props.row?.intro ?? '',
  },
})

const { mutate: createRow, isPending: isCreating } = useCreateHealthSignMutation()
const { mutate: updateRow, isPending: isUpdating } = useUpdateHealthSignMutation()
const isPending = computed(() => isCreating.value || isUpdating.value)

const onSubmit = handleSubmit((form) => {
  const payload: HealthSignSave = {
    signId: isEdit.value ? props.row?.signId : undefined,
    userName: form.userName.trim(),
    userId: form.userId?.trim() || undefined,
    userPhone: form.userPhone?.trim() || undefined,
    contactName: form.contactName?.trim() || undefined,
    title: form.title?.trim() || undefined,
    signDate: form.signDate?.trim() || undefined,
    endTime: form.endTime?.trim() || undefined,
    status: form.status === 1 || form.status === 2 || form.status === 3 ? form.status : 1,
    intro: form.intro?.trim() || undefined,
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
      <FormField v-slot="{ componentField }" name="userName">
        <FormItem>
          <FormLabel required>
            姓名
          </FormLabel>
          <FormControl><Input v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="userId">
        <FormItem>
          <FormLabel>居民编号</FormLabel>
          <FormControl><Input v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="userPhone">
        <FormItem>
          <FormLabel>电话</FormLabel>
          <FormControl><Input maxlength="20" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="contactName">
        <FormItem>
          <FormLabel>家庭医生</FormLabel>
          <FormControl><Input v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="title">
        <FormItem>
          <FormLabel>职称</FormLabel>
          <FormControl><Input v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="signDate">
        <FormItem>
          <FormLabel>签约日期</FormLabel>
          <FormControl><DatePicker placeholder="选择日期" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="endTime">
        <FormItem>
          <FormLabel>到期时间</FormLabel>
          <FormControl><DateTimePicker placeholder="选择时间" v-bind="componentField" /></FormControl>
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
    <FormField v-slot="{ componentField }" name="intro">
      <FormItem>
        <FormLabel>所属机构</FormLabel>
        <FormControl><Textarea rows="4" v-bind="componentField" /></FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <p class="text-xs text-muted-foreground">
      续约或解约直接改状态和日期。居民编号不填的话，居民在手机上看不到。
    </p>
    <Button type="submit" class="w-full" :disabled="isPending">
      {{ isPending ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
