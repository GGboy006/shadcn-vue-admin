<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { MediateCase, MediateSave } from '@/services/api/neighborhood-resident.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateMediateMutation, useUpdateMediateMutation } from '@/services/api/neighborhood-resident.api'
import { optionalContactPhone, optionalNumber } from '@/validators/common'

const props = defineProps<{ row?: MediateCase }>()
const emit = defineEmits<{ close: [] }>()
const isEdit = computed(() => !!props.row?.mediateId)

const typeOptions = [
  { value: 1, label: '邻里纠纷' },
  { value: 2, label: '土地纠纷' },
  { value: 3, label: '家庭矛盾' },
  { value: 4, label: '债务纠纷' },
  { value: 5, label: '其他' },
] as const

const statusOptions = [
  { value: 1, label: '待受理' },
  { value: 2, label: '调解中' },
  { value: 3, label: '已达成' },
  { value: 4, label: '已结案' },
] as const

const schema = z.object({
  userName: z.string().trim().min(1, '请填写申请人'),
  userPhone: optionalContactPhone,
  type: optionalNumber.refine((value): value is number => value === 1 || value === 2 || value === 3 || value === 4 || value === 5, '请选择类型'),
  status: optionalNumber,
  content: z.string().trim().min(1, '请填写事情经过'),
})

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    userName: props.row?.userName ?? '',
    userPhone: props.row?.userPhone ?? '',
    type: props.row?.type ?? 1,
    status: props.row?.status ?? 1,
    content: props.row?.content ?? '',
  },
})

const { mutate: createRow, isPending: isCreating } = useCreateMediateMutation()
const { mutate: updateRow, isPending: isUpdating } = useUpdateMediateMutation()
const isPending = computed(() => isCreating.value || isUpdating.value)

const onSubmit = handleSubmit((form) => {
  const payload: MediateSave = {
    mediateId: isEdit.value ? props.row?.mediateId : undefined,
    userName: form.userName.trim(),
    userPhone: form.userPhone?.trim() || undefined,
    type: form.type === 1 || form.type === 2 || form.type === 3 || form.type === 4 || form.type === 5 ? form.type : 1,
    status: form.status === 1 || form.status === 2 || form.status === 3 || form.status === 4 ? form.status : 1,
    content: form.content.trim(),
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
            申请人
          </FormLabel>
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
    <FormField v-slot="{ componentField }" name="content">
      <FormItem>
        <FormLabel required>
          事情经过
        </FormLabel>
        <FormControl><Textarea rows="4" v-bind="componentField" /></FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <Button type="submit" class="w-full" :disabled="isPending">
      {{ isPending ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
