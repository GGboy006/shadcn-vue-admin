<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { PartyActivity, PartyActivitySave } from '@/services/api/neighborhood-governance.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreatePartyActivityMutation, useUpdatePartyActivityMutation } from '@/services/api/neighborhood-governance.api'
import { optionalInt, optionalNumber, optionalString } from '@/validators/common'

const props = defineProps<{ row?: PartyActivity }>()
const emit = defineEmits<{ close: [] }>()
const isEdit = computed(() => !!props.row?.activityId)

const statusOptions = [
  { value: 1, label: '计划中' },
  { value: 2, label: '进行中' },
  { value: 3, label: '已完成' },
] as const

const schema = z.object({
  name: z.string().trim().min(1, '请填写活动名称'),
  describes: optionalString,
  status: optionalNumber,
  sortOrder: optionalInt,
})

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    name: props.row?.name ?? '',
    describes: props.row?.describes ?? '',
    status: props.row?.status ?? 1,
    sortOrder: props.row?.sortOrder ?? undefined,
  },
})

const { mutate: createRow, isPending: isCreating } = useCreatePartyActivityMutation()
const { mutate: updateRow, isPending: isUpdating } = useUpdatePartyActivityMutation()
const isPending = computed(() => isCreating.value || isUpdating.value)

function activityStatus(value?: number): 1 | 2 | 3 {
  if (value === 2 || value === 3)
    return value
  return 1
}

const onSubmit = handleSubmit((form) => {
  const payload: PartyActivitySave = {
    activityId: isEdit.value ? props.row?.activityId : undefined,
    name: form.name.trim(),
    describes: form.describes?.trim() || undefined,
    status: activityStatus(form.status),
    sortOrder: form.sortOrder,
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
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel required>
          活动名称
        </FormLabel>
        <FormControl><Input v-bind="componentField" /></FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <div class="grid gap-4 sm:grid-cols-2">
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
      <FormField v-slot="{ componentField }" name="sortOrder">
        <FormItem>
          <FormLabel>排序</FormLabel>
          <FormControl><Input type="number" placeholder="小的在前" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>
    <FormField v-slot="{ componentField }" name="describes">
      <FormItem>
        <FormLabel>说明</FormLabel>
        <FormControl><Textarea rows="3" v-bind="componentField" /></FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <Button type="submit" class="w-full" :disabled="isPending">
      {{ isPending ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
