<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { FinanceLedger, FinanceSave } from '@/services/api/neighborhood-governance.api'

import { DateTimePicker } from '@/components/prop-ui/date-picker'
import { RichTextEditor } from '@/components/prop-ui/rich-text'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateFinanceMutation, useUpdateFinanceMutation } from '@/services/api/neighborhood-governance.api'
import { optionalNumber, optionalString } from '@/validators/common'

const props = defineProps<{
  ledger?: FinanceLedger
}>()

const emit = defineEmits<{ close: [] }>()

const isEdit = computed(() => !!props.ledger?.financeId)
const statusOptions = [
  { value: 1, label: '公示中' },
  { value: 2, label: '已归档' },
] as const

const amount = z.union([z.number(), z.string(), z.null(), z.undefined()]).transform((value) => {
  if (value === '' || value === null || value === undefined)
    return undefined
  const num = typeof value === 'string' ? Number(value) : value
  return Number.isNaN(num) ? undefined : num
}).refine((value): value is number => typeof value === 'number' && value >= 0, '请填写不小于 0 的金额')

const schema = z.object({
  month: z.string().trim().regex(/^\d{4}-\d{2}$/, '请选择月份'),
  income: amount,
  expense: amount,
  content: optionalString,
  status: optionalNumber,
})

const { handleSubmit, setFieldValue, values } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    month: props.ledger?.month ?? '',
    income: props.ledger?.income ?? undefined,
    expense: props.ledger?.expense ?? undefined,
    content: props.ledger?.content ?? '',
    status: props.ledger?.status ?? 1,
  },
})

const balance = computed(() => Number(values.income || 0) - Number(values.expense || 0))

const { mutate: createFinance, isPending: isCreating } = useCreateFinanceMutation()
const { mutate: updateFinance, isPending: isUpdating } = useUpdateFinanceMutation()
const isPending = computed(() => isCreating.value || isUpdating.value)

const onSubmit = handleSubmit((form) => {
  const payload: FinanceSave = {
    financeId: isEdit.value ? props.ledger?.financeId : undefined,
    month: form.month,
    income: form.income,
    expense: form.expense,
    content: form.content?.trim() || undefined,
    status: form.status === 2 ? 2 : 1,
  }
  const mutate = isEdit.value ? updateFinance : createFinance
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

function money(value: number) {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<template>
  <form class="space-y-4" @submit="onSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
      <FormField v-slot="{ componentField }" name="month">
        <FormItem>
          <FormLabel required>
            所属月份
          </FormLabel>
          <FormControl>
            <DateTimePicker v-bind="componentField" hide-time value-format="YYYY-MM" placeholder="选择月份" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <div class="space-y-2">
        <Label>结余</Label>
        <Input :model-value="money(balance)" readonly />
      </div>
      <FormField v-slot="{ componentField }" name="income">
        <FormItem>
          <FormLabel required>
            收入合计
          </FormLabel>
          <FormControl>
            <Input type="number" min="0" step="0.01" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="expense">
        <FormItem>
          <FormLabel required>
            支出合计
          </FormLabel>
          <FormControl>
            <Input type="number" min="0" step="0.01" v-bind="componentField" />
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
    <FormField name="content">
      <FormItem>
        <FormLabel>收支说明</FormLabel>
        <FormControl>
          <RichTextEditor
            :model-value="values.content ?? ''"
            placeholder="请输入收支说明"
            :min-height="200"
            @update:model-value="setFieldValue('content', $event ?? '')"
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
