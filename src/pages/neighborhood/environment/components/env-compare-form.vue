<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { EnvCompare, EnvCompareSave } from '@/services/api/neighborhood-resident.api'

import ImageUpload from '@/components/image-upload/image-upload.vue'
import { DatePicker } from '@/components/prop-ui/date-picker'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateEnvCompareMutation, useUpdateEnvCompareMutation } from '@/services/api/neighborhood-resident.api'
import { optionalNumber, optionalString } from '@/validators/common'

const props = defineProps<{ row?: EnvCompare }>()
const emit = defineEmits<{ close: [] }>()
const isEdit = computed(() => !!props.row?.compareId)

const statusOptions = [
  { value: 1, label: '进行中' },
  { value: 2, label: '已完成' },
] as const

const schema = z.object({
  name: z.string().trim().min(1, '请填写项目名称'),
  address: optionalString,
  signDate: optionalString,
  status: optionalNumber,
  poster: optionalString,
  logo: optionalString,
})

const { handleSubmit, setFieldValue, values } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    name: props.row?.name ?? '',
    address: props.row?.address ?? '',
    signDate: props.row?.signDate ?? '',
    status: props.row?.status ?? 1,
    poster: props.row?.poster ?? '',
    logo: props.row?.logo ?? '',
  },
})

const { mutate: createRow, isPending: isCreating } = useCreateEnvCompareMutation()
const { mutate: updateRow, isPending: isUpdating } = useUpdateEnvCompareMutation()
const isPending = computed(() => isCreating.value || isUpdating.value)

const onSubmit = handleSubmit((form) => {
  const payload: EnvCompareSave = {
    compareId: isEdit.value ? props.row?.compareId : undefined,
    name: form.name.trim(),
    address: form.address?.trim() || undefined,
    signDate: form.signDate?.trim() || undefined,
    status: form.status === 1 || form.status === 2 ? form.status : 1,
    poster: form.poster?.trim() || undefined,
    logo: form.logo?.trim() || undefined,
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
            项目名称
          </FormLabel>
          <FormControl><Input v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="address">
        <FormItem>
          <FormLabel>位置</FormLabel>
          <FormControl><Input v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="signDate">
        <FormItem>
          <FormLabel>日期</FormLabel>
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
    <FormField name="poster">
      <FormItem>
        <FormLabel>整改前</FormLabel>
        <FormControl>
          <ImageUpload
            :model-value="values.poster"
            alt="整改前"
            @update:model-value="setFieldValue('poster', $event || undefined)"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField name="logo">
      <FormItem>
        <FormLabel>整改后</FormLabel>
        <FormControl>
          <ImageUpload
            :model-value="values.logo"
            alt="整改后"
            @update:model-value="setFieldValue('logo', $event || undefined)"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <Button type="submit" class="w-full" :disabled="isPending">
      {{ isPending ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
