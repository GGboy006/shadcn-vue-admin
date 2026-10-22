<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { Mediator, MediatorSave } from '@/services/api/neighborhood-resident.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateMediatorMutation, useUpdateMediatorMutation } from '@/services/api/neighborhood-resident.api'
import { optionalContactPhone, optionalInt, optionalNumber, optionalString } from '@/validators/common'

const props = defineProps<{ row?: Mediator }>()
const emit = defineEmits<{ close: [] }>()
const isEdit = computed(() => !!props.row?.mediatorId)

const statusOptions = [
  { value: 1, label: '在岗' },
  { value: 2, label: '停用' },
] as const

const schema = z.object({
  name: z.string().trim().min(1, '请填写姓名'),
  title: optionalString,
  phone: optionalContactPhone,
  status: optionalNumber,
  sortOrder: optionalInt.refine(value => value === undefined || value >= 0, '请填写不小于 0 的整数'),
  intro: optionalString,
})

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    name: props.row?.name ?? '',
    title: props.row?.title ?? '',
    phone: props.row?.phone ?? '',
    status: props.row?.status ?? 1,
    sortOrder: props.row?.sortOrder ?? undefined,
    intro: props.row?.intro ?? '',
  },
})

const { mutate: createRow, isPending: isCreating } = useCreateMediatorMutation()
const { mutate: updateRow, isPending: isUpdating } = useUpdateMediatorMutation()
const isPending = computed(() => isCreating.value || isUpdating.value)

const onSubmit = handleSubmit((form) => {
  const payload: MediatorSave = {
    mediatorId: isEdit.value ? props.row?.mediatorId : undefined,
    name: form.name.trim(),
    title: form.title?.trim() || undefined,
    phone: form.phone?.trim() || undefined,
    status: form.status === 1 || form.status === 2 ? form.status : 1,
    sortOrder: form.sortOrder,
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
      <FormField v-slot="{ componentField }" name="name">
        <FormItem>
          <FormLabel required>
            姓名
          </FormLabel>
          <FormControl><Input v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="title">
        <FormItem>
          <FormLabel>职务</FormLabel>
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
      <FormField v-slot="{ componentField }" name="sortOrder">
        <FormItem>
          <FormLabel>排序</FormLabel>
          <FormControl><Input type="number" min="0" step="1" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>
    <FormField v-slot="{ componentField }" name="intro">
      <FormItem>
        <FormLabel>简介</FormLabel>
        <FormControl><Textarea rows="4" v-bind="componentField" /></FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <p class="text-xs text-muted-foreground">
      居民端只显示在岗的调解员。
    </p>
    <Button type="submit" class="w-full" :disabled="isPending">
      {{ isPending ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
