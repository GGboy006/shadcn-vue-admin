<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { PointRule, PointRuleSave } from '@/services/api/neighborhood-resident.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreatePointRuleMutation, useUpdatePointRuleMutation } from '@/services/api/neighborhood-resident.api'
import { optionalInt, optionalNumber } from '@/validators/common'

const props = defineProps<{ row?: PointRule }>()
const emit = defineEmits<{ close: [] }>()
const isEdit = computed(() => !!props.row?.ruleId)

const typeOptions = [
  { value: 1, label: '志愿服务' },
  { value: 2, label: '文明行为' },
  { value: 3, label: '学习提升' },
  { value: 4, label: '违规扣分' },
] as const

const statusOptions = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const schema = z.object({
  name: z.string().trim().min(1, '请填写名称'),
  type: optionalNumber.refine((value): value is number => value === 1 || value === 2 || value === 3 || value === 4, '请选择类型'),
  points: optionalNumber.refine((value): value is number => typeof value === 'number', '请填写分值'),
  status: optionalNumber,
  sortOrder: optionalInt.refine(value => value === undefined || value >= 0, '请填写不小于 0 的整数'),
})

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    name: props.row?.name ?? '',
    type: props.row?.type ?? 1,
    points: props.row?.points ?? undefined,
    status: props.row?.status ?? 1,
    sortOrder: props.row?.sortOrder ?? undefined,
  },
})

const { mutate: createRow, isPending: isCreating } = useCreatePointRuleMutation()
const { mutate: updateRow, isPending: isUpdating } = useUpdatePointRuleMutation()
const isPending = computed(() => isCreating.value || isUpdating.value)

const onSubmit = handleSubmit((form) => {
  const payload: PointRuleSave = {
    ruleId: isEdit.value ? props.row?.ruleId : undefined,
    name: form.name.trim(),
    type: form.type === 1 || form.type === 2 || form.type === 3 || form.type === 4 ? form.type : 1,
    points: form.points,
    status: form.status === 1 || form.status === 2 ? form.status : 1,
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
    <div class="grid gap-4 sm:grid-cols-2">
      <FormField v-slot="{ componentField }" name="name">
        <FormItem>
          <FormLabel required>
            名称
          </FormLabel>
          <FormControl><Input v-bind="componentField" /></FormControl>
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
      <FormField v-slot="{ componentField }" name="points">
        <FormItem>
          <FormLabel required>
            分值
          </FormLabel>
          <FormControl><Input type="number" step="1" v-bind="componentField" /></FormControl>
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
    <p class="text-xs text-muted-foreground">
      违规扣分填负数。
    </p>
    <Button type="submit" class="w-full" :disabled="isPending">
      {{ isPending ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
