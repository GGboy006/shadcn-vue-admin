<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { HealthRecord, HealthRecordSave } from '@/services/api/neighborhood-resident.api'

import { DatePicker } from '@/components/prop-ui/date-picker'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateHealthMutation, useUpdateHealthMutation } from '@/services/api/neighborhood-resident.api'
import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

const props = defineProps<{ row?: HealthRecord }>()
const emit = defineEmits<{ close: [] }>()
const isEdit = computed(() => !!props.row?.healthId)

const genderOptions = [
  { value: 1, label: '男' },
  { value: 2, label: '女' },
] as const

const statusOptions = [
  { value: 1, label: '已建档' },
  { value: 2, label: '未建档' },
] as const

const schema = z.object({
  userName: z.string().trim().min(1, '请填写姓名'),
  userId: optionalString,
  code: optionalString,
  gender: optionalNumber,
  age: optionalInt.refine(value => value === undefined || value >= 0, '请填写不小于 0 的整数'),
  height: optionalNumber.refine(value => value === undefined || value >= 0, '请填写不小于 0 的数字'),
  weight: optionalNumber.refine(value => value === undefined || value >= 0, '请填写不小于 0 的数字'),
  bloodPressure: optionalString,
  bloodSugar: optionalString,
  signDate: optionalString,
  status: optionalNumber,
  intro: optionalString,
})

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    userName: props.row?.userName ?? '',
    userId: props.row?.userId ?? '',
    code: props.row?.code ?? '',
    gender: props.row?.gender ?? undefined,
    age: props.row?.age ?? undefined,
    height: props.row?.height ?? undefined,
    weight: props.row?.weight ?? undefined,
    bloodPressure: props.row?.bloodPressure ?? '',
    bloodSugar: props.row?.bloodSugar ?? '',
    signDate: props.row?.signDate ?? '',
    status: props.row?.status ?? 1,
    intro: props.row?.intro ?? '',
  },
})

const { mutate: createRow, isPending: isCreating } = useCreateHealthMutation()
const { mutate: updateRow, isPending: isUpdating } = useUpdateHealthMutation()
const isPending = computed(() => isCreating.value || isUpdating.value)

const onSubmit = handleSubmit((form) => {
  const payload: HealthRecordSave = {
    healthId: isEdit.value ? props.row?.healthId : undefined,
    userName: form.userName.trim(),
    userId: form.userId?.trim() || undefined,
    code: form.code?.trim() || undefined,
    gender: form.gender === 1 || form.gender === 2 ? form.gender : undefined,
    age: form.age,
    height: form.height,
    weight: form.weight,
    bloodPressure: form.bloodPressure?.trim() || undefined,
    bloodSugar: form.bloodSugar?.trim() || undefined,
    signDate: form.signDate?.trim() || undefined,
    status: form.status === 1 || form.status === 2 ? form.status : 1,
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
      <FormField v-slot="{ componentField }" name="code">
        <FormItem>
          <FormLabel>档案号</FormLabel>
          <FormControl><Input v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="gender">
        <FormItem>
          <FormLabel>性别</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem v-for="item in genderOptions" :key="item.value" :value="item.value">
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
      <FormField v-slot="{ componentField }" name="height">
        <FormItem>
          <FormLabel>身高（厘米）</FormLabel>
          <FormControl><Input type="number" min="0" step="0.1" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="weight">
        <FormItem>
          <FormLabel>体重（千克）</FormLabel>
          <FormControl><Input type="number" min="0" step="0.1" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="bloodPressure">
        <FormItem>
          <FormLabel>血压</FormLabel>
          <FormControl><Input placeholder="如：120/80" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="bloodSugar">
        <FormItem>
          <FormLabel>血糖</FormLabel>
          <FormControl><Input v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="signDate">
        <FormItem>
          <FormLabel>体检日期</FormLabel>
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
    <FormField v-slot="{ componentField }" name="intro">
      <FormItem>
        <FormLabel>体检机构</FormLabel>
        <FormControl><Textarea rows="4" v-bind="componentField" /></FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <p class="text-xs text-muted-foreground">
      居民编号不填的话，居民在手机上看不到这份档案。
    </p>
    <Button type="submit" class="w-full" :disabled="isPending">
      {{ isPending ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
