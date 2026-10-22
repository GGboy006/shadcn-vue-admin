<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { EnvNews, EnvNewsSave } from '@/services/api/neighborhood-resident.api'

import { DatePicker } from '@/components/prop-ui/date-picker'
import { RichTextEditor } from '@/components/prop-ui/rich-text'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateEnvNewsMutation, useUpdateEnvNewsMutation } from '@/services/api/neighborhood-resident.api'
import { optionalNumber, optionalString } from '@/validators/common'

const props = defineProps<{ row?: EnvNews }>()
const emit = defineEmits<{ close: [] }>()
const isEdit = computed(() => !!props.row?.newsId)

const statusOptions = [
  { value: 1, label: '发布' },
  { value: 2, label: '草稿' },
] as const

const schema = z.object({
  name: z.string().trim().min(1, '请填写标题'),
  signDate: optionalString,
  status: optionalNumber,
  describes: optionalString,
  content: optionalString,
})

const { handleSubmit, setFieldValue, values } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    name: props.row?.name ?? '',
    signDate: props.row?.signDate ?? '',
    status: props.row?.status ?? 1,
    describes: props.row?.describes ?? '',
    content: props.row?.content ?? '',
  },
})

const { mutate: createRow, isPending: isCreating } = useCreateEnvNewsMutation()
const { mutate: updateRow, isPending: isUpdating } = useUpdateEnvNewsMutation()
const isPending = computed(() => isCreating.value || isUpdating.value)

const onSubmit = handleSubmit((form) => {
  const payload: EnvNewsSave = {
    newsId: isEdit.value ? props.row?.newsId : undefined,
    name: form.name.trim(),
    signDate: form.signDate?.trim() || undefined,
    status: form.status === 1 || form.status === 2 ? form.status : 1,
    describes: form.describes?.trim() || undefined,
    content: form.content?.trim() || undefined,
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
            标题
          </FormLabel>
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
    <FormField v-slot="{ componentField }" name="describes">
      <FormItem>
        <FormLabel>摘要</FormLabel>
        <FormControl><Textarea rows="4" v-bind="componentField" /></FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField name="content">
      <FormItem>
        <FormLabel>正文</FormLabel>
        <FormControl>
          <RichTextEditor
            :model-value="values.content ?? ''"
            placeholder="请输入正文"
            :min-height="200"
            @update:model-value="setFieldValue('content', $event ?? '')"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <p class="text-xs text-muted-foreground">
      居民端只显示已发布的动态。顶部「整治动态」数量等于这里已发布的条数。
    </p>
    <Button type="submit" class="w-full" :disabled="isPending">
      {{ isPending ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
