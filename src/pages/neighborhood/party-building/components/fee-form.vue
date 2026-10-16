<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { PartyFee, PartyFeeSave } from '@/services/api/neighborhood-governance.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateFeeMutation, useUpdateFeeMutation } from '@/services/api/neighborhood-governance.api'
import { optionalNumber } from '@/validators/common'

const props = defineProps<{ row?: PartyFee }>()
const emit = defineEmits<{ close: [] }>()
const isEdit = computed(() => !!props.row?.feeId)

const statusOptions = [
  { value: 1, label: '收缴中' },
  { value: 2, label: '已完成' },
] as const

const count = z.union([z.number(), z.string(), z.null(), z.undefined()]).transform((value) => {
  if (value === '' || value === null || value === undefined)
    return undefined
  const num = typeof value === 'string' ? Number(value) : value
  return Number.isNaN(num) ? undefined : num
}).refine((value): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0, '请填写不小于 0 的整数')

const amount = z.union([z.number(), z.string(), z.null(), z.undefined()]).transform((value) => {
  if (value === '' || value === null || value === undefined)
    return undefined
  const num = typeof value === 'string' ? Number(value) : value
  return Number.isNaN(num) ? undefined : num
}).refine((value): value is number => typeof value === 'number' && value >= 0, '请填写不小于 0 的金额')

const schema = z.object({
  name: z.string().trim().min(1, '请填写季度名称'),
  shouldCount: count,
  paidCount: count,
  salePrice: amount,
  status: optionalNumber,
})

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    name: props.row?.name ?? '',
    shouldCount: props.row?.shouldCount ?? undefined,
    paidCount: props.row?.paidCount ?? undefined,
    salePrice: props.row?.salePrice ?? undefined,
    status: props.row?.status ?? 1,
  },
})

const { mutate: createRow, isPending: isCreating } = useCreateFeeMutation()
const { mutate: updateRow, isPending: isUpdating } = useUpdateFeeMutation()
const isPending = computed(() => isCreating.value || isUpdating.value)

const onSubmit = handleSubmit((form) => {
  const payload: PartyFeeSave = {
    feeId: isEdit.value ? props.row?.feeId : undefined,
    name: form.name.trim(),
    shouldCount: form.shouldCount,
    paidCount: form.paidCount,
    salePrice: form.salePrice,
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
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel required>
          季度
        </FormLabel>
        <FormControl><Input placeholder="如：2026年第二季度" v-bind="componentField" /></FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <div class="grid gap-4 sm:grid-cols-2">
      <FormField v-slot="{ componentField }" name="shouldCount">
        <FormItem>
          <FormLabel required>
            应缴人数
          </FormLabel>
          <FormControl><Input type="number" min="0" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="paidCount">
        <FormItem>
          <FormLabel required>
            实缴人数
          </FormLabel>
          <FormControl><Input type="number" min="0" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="salePrice">
        <FormItem>
          <FormLabel required>
            总额（元）
          </FormLabel>
          <FormControl><Input type="number" min="0" step="0.01" v-bind="componentField" /></FormControl>
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
    <p v-if="row" class="text-xs text-muted-foreground">
      缴纳比例 {{ row.feeRate }}%，由接口计算，不能手填。
    </p>
    <Button type="submit" class="w-full" :disabled="isPending">
      {{ isPending ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
