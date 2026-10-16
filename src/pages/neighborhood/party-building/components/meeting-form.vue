<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { PartyMeeting, PartyMeetingSave } from '@/services/api/neighborhood-governance.api'

import { DateTimePicker } from '@/components/prop-ui/date-picker'
import { RichTextEditor } from '@/components/prop-ui/rich-text'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateMeetingMutation, useUpdateMeetingMutation } from '@/services/api/neighborhood-governance.api'
import { optionalNumber, optionalString } from '@/validators/common'

const props = defineProps<{ row?: PartyMeeting }>()
const emit = defineEmits<{ close: [] }>()
const isEdit = computed(() => !!props.row?.meetingId)

const typeOptions = [
  { value: 1, label: '支部党员大会' },
  { value: 2, label: '支部委员会' },
  { value: 3, label: '党小组会' },
  { value: 4, label: '党课' },
] as const
const statusOptions = [
  { value: 1, label: '计划中' },
  { value: 2, label: '已召开' },
] as const

const schema = z.object({
  type: optionalNumber,
  name: z.string().trim().min(1, '请填写主题'),
  startTime: optionalString,
  address: optionalString,
  content: optionalString,
  describes: optionalString,
  status: optionalNumber,
})

const { handleSubmit, setFieldValue, values } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    type: props.row?.type ?? 1,
    name: props.row?.name ?? '',
    startTime: props.row?.startTime ?? '',
    address: props.row?.address ?? '',
    content: props.row?.content ?? '',
    describes: props.row?.describes ?? '',
    status: props.row?.status ?? 1,
  },
})

const { mutate: createRow, isPending: isCreating } = useCreateMeetingMutation()
const { mutate: updateRow, isPending: isUpdating } = useUpdateMeetingMutation()
const isPending = computed(() => isCreating.value || isUpdating.value)

function meetingType(value?: number): 1 | 2 | 3 | 4 {
  if (value === 2 || value === 3 || value === 4)
    return value
  return 1
}

const onSubmit = handleSubmit((form) => {
  const payload: PartyMeetingSave = {
    meetingId: isEdit.value ? props.row?.meetingId : undefined,
    type: meetingType(form.type),
    name: form.name.trim(),
    startTime: form.startTime || undefined,
    address: form.address?.trim() || undefined,
    content: form.content?.trim() || undefined,
    describes: form.describes?.trim() || undefined,
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
      <FormField v-slot="{ componentField }" name="type">
        <FormItem>
          <FormLabel required>
            类型
          </FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue />
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
      <FormField v-slot="{ componentField }" name="name">
        <FormItem>
          <FormLabel required>
            主题
          </FormLabel>
          <FormControl><Input v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="startTime">
        <FormItem>
          <FormLabel>时间</FormLabel>
          <FormControl>
            <DateTimePicker v-bind="componentField" placeholder="选择时间" />
          </FormControl>
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
      <FormField v-slot="{ componentField }" name="status">
        <FormItem>
          <FormLabel>状态</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue />
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
    <FormField name="content">
      <FormItem>
        <FormLabel>内容</FormLabel>
        <FormControl>
          <RichTextEditor
            :model-value="values.content ?? ''"
            placeholder="请输入会议内容"
            :min-height="160"
            @update:model-value="setFieldValue('content', $event ?? '')"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="describes">
      <FormItem>
        <FormLabel>决议摘要</FormLabel>
        <FormControl><Textarea rows="2" v-bind="componentField" /></FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <Button type="submit" class="w-full" :disabled="isPending">
      {{ isPending ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
