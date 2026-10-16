<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { VillageMember, VillageMemberSave } from '@/services/api/neighborhood-governance.api'

import ImageUpload from '@/components/image-upload/image-upload.vue'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateMemberMutation, useUpdateMemberMutation } from '@/services/api/neighborhood-governance.api'
import { optionalContactPhone, optionalInt, optionalNumber, optionalString } from '@/validators/common'

const props = defineProps<{
  member?: VillageMember
}>()

const emit = defineEmits<{ close: [] }>()

const isEdit = computed(() => !!props.member?.memberId)

const statusOptions = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const schema = z.object({
  name: z.string().trim().min(1, '请填写姓名'),
  title: z.string().trim().min(1, '请填写职务'),
  phone: optionalContactPhone,
  avatar: optionalString,
  description: optionalString,
  status: optionalNumber,
  sortOrder: optionalInt,
})

const { handleSubmit, setFieldValue, values } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    name: props.member?.name ?? '',
    title: props.member?.title ?? '',
    phone: props.member?.phone ?? '',
    avatar: props.member?.avatar ?? undefined,
    description: props.member?.description ?? '',
    status: props.member?.status ?? 1,
    sortOrder: props.member?.sortOrder ?? undefined,
  },
})

const { mutate: createMember, isPending: isCreating } = useCreateMemberMutation()
const { mutate: updateMember, isPending: isUpdating } = useUpdateMemberMutation()
const isPending = computed(() => isCreating.value || isUpdating.value)

function buildPayload(form: z.infer<typeof schema>): VillageMemberSave {
  return {
    memberId: isEdit.value ? props.member?.memberId : undefined,
    name: form.name.trim(),
    title: form.title.trim(),
    phone: form.phone?.trim() || undefined,
    avatar: form.avatar || undefined,
    description: form.description?.trim() || undefined,
    status: form.status === 2 ? 2 : 1,
    sortOrder: form.sortOrder,
  }
}

const onSubmit = handleSubmit((form) => {
  const payload = buildPayload(form)
  const mutate = isEdit.value ? updateMember : createMember
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
          <FormControl>
            <Input v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="title">
        <FormItem>
          <FormLabel required>
            职务
          </FormLabel>
          <FormControl>
            <Input placeholder="如：村党支部书记" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="phone">
        <FormItem>
          <FormLabel>电话</FormLabel>
          <FormControl>
            <Input v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="sortOrder">
        <FormItem>
          <FormLabel>排序</FormLabel>
          <FormControl>
            <Input type="number" placeholder="小的在前" v-bind="componentField" />
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
    </div>
    <FormField name="avatar">
      <FormItem>
        <FormLabel>照片</FormLabel>
        <FormControl>
          <ImageUpload
            :model-value="values.avatar"
            shape="circle"
            alt="成员照片"
            @update:model-value="setFieldValue('avatar', $event || undefined)"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="description">
      <FormItem>
        <FormLabel>分工说明</FormLabel>
        <FormControl>
          <Textarea rows="3" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <Button type="submit" class="w-full" :disabled="isPending">
      {{ isPending ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
