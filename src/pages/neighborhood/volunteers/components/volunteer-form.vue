<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { Volunteer, VolunteerSave } from '@/services/api/neighborhood-resident.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateVolunteerMutation, useUpdateVolunteerMutation } from '@/services/api/neighborhood-resident.api'
import { optionalContactPhone, optionalNumber, optionalString } from '@/validators/common'

const props = defineProps<{ row?: Volunteer }>()
const emit = defineEmits<{ close: [] }>()
const isEdit = computed(() => !!props.row?.volunteerId)

const statusOptions = [
  { value: 2, label: '正常' },
  { value: 4, label: '停用' },
] as const

const schema = z.object({
  userName: z.string().trim().min(1, '请填写姓名'),
  userPhone: optionalContactPhone,
  userId: optionalString,
  businessHours: optionalString,
  status: optionalNumber,
  intro: optionalString,
})

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    userName: props.row?.userName ?? '',
    userPhone: props.row?.userPhone ?? '',
    userId: props.row?.userId ?? '',
    businessHours: props.row?.businessHours ?? '',
    status: props.row?.status ?? 2,
    intro: props.row?.intro ?? '',
  },
})

const { mutate: createRow, isPending: isCreating } = useCreateVolunteerMutation()
const { mutate: updateRow, isPending: isUpdating } = useUpdateVolunteerMutation()
const isPending = computed(() => isCreating.value || isUpdating.value)

const onSubmit = handleSubmit((form) => {
  const payload: VolunteerSave = {
    volunteerId: isEdit.value ? props.row?.volunteerId : undefined,
    userName: form.userName.trim(),
    userPhone: form.userPhone?.trim() || undefined,
    userId: form.userId?.trim() || undefined,
    businessHours: form.businessHours?.trim() || undefined,
    status: form.status === 2 || form.status === 4 ? form.status : 2,
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
      <FormField v-slot="{ componentField }" name="userPhone">
        <FormItem>
          <FormLabel>电话</FormLabel>
          <FormControl><Input maxlength="20" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="userId">
        <FormItem>
          <FormLabel>居民编号</FormLabel>
          <FormControl><Input placeholder="不填也可以，只在后台留名" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="businessHours">
        <FormItem>
          <FormLabel>服务时间</FormLabel>
          <FormControl><Input placeholder="如：周末" v-bind="componentField" /></FormControl>
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
        <FormLabel>简介</FormLabel>
        <FormControl><Textarea rows="4" v-bind="componentField" /></FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <p class="text-xs text-muted-foreground">
      累计时长用「记时长」累加，这里不填。
    </p>
    <Button type="submit" class="w-full" :disabled="isPending">
      {{ isPending ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
