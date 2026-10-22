<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { RepairOrder, RepairSave } from '@/services/api/neighborhood-resident.api'

import ImageUpload from '@/components/image-upload/image-upload.vue'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateRepairMutation, useUpdateRepairMutation } from '@/services/api/neighborhood-resident.api'
import { optionalContactPhone, optionalNumber, optionalString } from '@/validators/common'

const props = defineProps<{ row?: RepairOrder }>()
const emit = defineEmits<{ close: [] }>()
const isEdit = computed(() => !!props.row?.repairId)

const typeOptions = [
  { value: 1, label: '道路破损' },
  { value: 2, label: '路灯故障' },
  { value: 3, label: '垃圾堆积' },
  { value: 4, label: '水管问题' },
  { value: 5, label: '公共设施' },
  { value: 6, label: '其他' },
] as const

const statusOptions = [
  { value: 1, label: '待处理' },
  { value: 2, label: '处理中' },
  { value: 3, label: '已办结' },
] as const

const schema = z.object({
  type: optionalNumber.refine((value): value is number => value === 1 || value === 2 || value === 3 || value === 4 || value === 5 || value === 6, '请选择类型'),
  content: z.string().trim().min(1, '请填写问题描述'),
  name: optionalString,
  userName: optionalString,
  userPhone: optionalContactPhone,
  address: optionalString,
  contactName: optionalString,
  status: optionalNumber,
  poster: optionalString,
})

const { handleSubmit, setFieldValue, values } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    type: props.row?.type ?? 1,
    content: props.row?.content ?? '',
    name: props.row?.name ?? '',
    userName: props.row?.userName ?? '',
    userPhone: props.row?.userPhone ?? '',
    address: props.row?.address ?? '',
    contactName: props.row?.contactName ?? '',
    status: props.row?.status ?? 1,
    poster: props.row?.poster ?? '',
  },
})

const { mutate: createRow, isPending: isCreating } = useCreateRepairMutation()
const { mutate: updateRow, isPending: isUpdating } = useUpdateRepairMutation()
const isPending = computed(() => isCreating.value || isUpdating.value)

const onSubmit = handleSubmit((form) => {
  const payload: RepairSave = {
    repairId: isEdit.value ? props.row?.repairId : undefined,
    type: form.type === 1 || form.type === 2 || form.type === 3 || form.type === 4 || form.type === 5 || form.type === 6 ? form.type : 1,
    content: form.content.trim(),
    name: form.name?.trim() || undefined,
    userName: form.userName?.trim() || undefined,
    userPhone: form.userPhone?.trim() || undefined,
    address: form.address?.trim() || undefined,
    contactName: form.contactName?.trim() || undefined,
    status: form.status === 1 || form.status === 2 || form.status === 3 ? form.status : 1,
    poster: form.poster?.trim() || undefined,
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
    <FormField v-slot="{ componentField }" name="type">
      <FormItem>
        <FormLabel required>
          类型
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
    <FormField v-slot="{ componentField }" name="content">
      <FormItem>
        <FormLabel required>
          问题描述
        </FormLabel>
        <FormControl><Textarea rows="4" placeholder="发生了什么" v-bind="componentField" /></FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <div class="grid gap-4 sm:grid-cols-2">
      <FormField v-slot="{ componentField }" name="name">
        <FormItem>
          <FormLabel>标题</FormLabel>
          <FormControl><Input placeholder="不填则用描述开头" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="userName">
        <FormItem>
          <FormLabel>报修人</FormLabel>
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
      <FormField v-slot="{ componentField }" name="address">
        <FormItem>
          <FormLabel>地点</FormLabel>
          <FormControl><Input v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="contactName">
        <FormItem>
          <FormLabel>联系人</FormLabel>
          <FormControl><Input v-bind="componentField" /></FormControl>
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
    <FormField name="poster">
      <FormItem>
        <FormLabel>现场照片</FormLabel>
        <FormControl>
          <ImageUpload
            :model-value="values.poster"
            alt="现场照片"
            @update:model-value="setFieldValue('poster', $event || undefined)"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <p class="text-xs text-muted-foreground">
      单号由系统生成。标题不填时，用描述开头。
    </p>
    <Button type="submit" class="w-full" :disabled="isPending">
      {{ isPending ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
