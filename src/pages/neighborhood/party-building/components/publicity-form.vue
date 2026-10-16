<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { PartyPublicity, PartyPublicitySave } from '@/services/api/neighborhood-governance.api'

import ImageUpload from '@/components/image-upload/image-upload.vue'
import { DatePicker, DateTimePicker } from '@/components/prop-ui/date-picker'
import { RichTextEditor } from '@/components/prop-ui/rich-text'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreatePublicityMutation, useUpdatePublicityMutation } from '@/services/api/neighborhood-governance.api'
import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

const props = defineProps<{ row?: PartyPublicity }>()
const emit = defineEmits<{ close: [] }>()
const isEdit = computed(() => !!props.row?.publicityId)

const genderOptions = [
  { value: 1, label: '男' },
  { value: 2, label: '女' },
] as const
const typeOptions = [
  { value: 1, label: '入党积极分子' },
  { value: 2, label: '发展对象' },
  { value: 3, label: '预备党员转正' },
] as const
const statusOptions = [
  { value: 1, label: '公示中' },
  { value: 2, label: '已结束' },
] as const

const schema = z.object({
  name: z.string().trim().min(1, '请填写姓名'),
  gender: optionalNumber,
  age: optionalInt,
  avatar: optionalString,
  type: optionalNumber,
  signDate: optionalString,
  startTime: optionalString,
  endTime: optionalString,
  content: optionalString,
  status: optionalNumber,
})

const { handleSubmit, setFieldValue, values } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    name: props.row?.name ?? '',
    gender: props.row?.gender ?? undefined,
    age: props.row?.age ?? undefined,
    avatar: props.row?.avatar ?? undefined,
    type: props.row?.type ?? 1,
    signDate: props.row?.signDate ?? '',
    startTime: props.row?.startTime ?? '',
    endTime: props.row?.endTime ?? '',
    content: props.row?.content ?? '',
    status: props.row?.status ?? 1,
  },
})

const { mutate: createRow, isPending: isCreating } = useCreatePublicityMutation()
const { mutate: updateRow, isPending: isUpdating } = useUpdatePublicityMutation()
const isPending = computed(() => isCreating.value || isUpdating.value)

function asGender(value?: number): 1 | 2 | undefined {
  if (value === 1 || value === 2)
    return value
  return undefined
}

function asType(value?: number) {
  if (value === 2 || value === 3)
    return value
  return value === 1 ? 1 : undefined
}

const onSubmit = handleSubmit((form) => {
  const payload: PartyPublicitySave = {
    publicityId: isEdit.value ? props.row?.publicityId : undefined,
    name: form.name.trim(),
    gender: asGender(form.gender),
    age: form.age,
    avatar: form.avatar || undefined,
    type: asType(form.type),
    signDate: form.signDate || undefined,
    startTime: form.startTime || undefined,
    endTime: form.endTime || undefined,
    content: form.content?.trim() || undefined,
    status: form.status === 2 ? 2 : 1,
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
          <FormLabel>类型</FormLabel>
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
          <FormControl><Input type="number" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="signDate">
        <FormItem>
          <FormLabel>确定日期</FormLabel>
          <FormControl>
            <DatePicker v-bind="componentField" placeholder="选择日期" />
          </FormControl>
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
      <FormField v-slot="{ componentField }" name="startTime">
        <FormItem>
          <FormLabel>公示开始</FormLabel>
          <FormControl>
            <DateTimePicker v-bind="componentField" placeholder="选择开始时间" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="endTime">
        <FormItem>
          <FormLabel>公示结束</FormLabel>
          <FormControl>
            <DateTimePicker v-bind="componentField" placeholder="选择结束时间" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>
    <FormField name="avatar">
      <FormItem>
        <FormLabel>照片</FormLabel>
        <ImageUpload :model-value="values.avatar" shape="circle" alt="公示照片" @update:model-value="setFieldValue('avatar', $event || undefined)" />
      </FormItem>
    </FormField>
    <FormField name="content">
      <FormItem>
        <FormLabel>公示说明</FormLabel>
        <FormControl>
          <RichTextEditor
            :model-value="values.content ?? ''"
            placeholder="请输入公示说明"
            :min-height="160"
            @update:model-value="setFieldValue('content', $event ?? '')"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <p v-if="row?.remainDays != null" class="text-xs text-muted-foreground">
      剩余 {{ row.remainDays }} 天，由接口计算。
    </p>
    <Button type="submit" class="w-full" :disabled="isPending">
      {{ isPending ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
