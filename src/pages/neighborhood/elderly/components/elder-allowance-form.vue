<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { ElderAllowance, ElderAllowanceSave } from '@/services/api/neighborhood-resident.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useCreateElderAllowanceMutation, useUpdateElderAllowanceMutation } from '@/services/api/neighborhood-resident.api'
import { optionalInt, optionalNumber } from '@/validators/common'

const props = defineProps<{ row?: ElderAllowance }>()
const emit = defineEmits<{ close: [] }>()
const isEdit = computed(() => !!props.row?.allowanceId)

const schema = z.object({
  name: z.string().trim().min(1, '请填写名称'),
  salePrice: optionalNumber.refine((value): value is number => typeof value === 'number' && value >= 0, '请填写不小于 0 的金额'),
  shouldCount: optionalInt.refine(value => value === undefined || value >= 0, '请填写不小于 0 的整数'),
  sortOrder: optionalInt.refine(value => value === undefined || value >= 0, '请填写不小于 0 的整数'),
})

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    name: props.row?.name ?? '',
    salePrice: props.row?.salePrice ?? undefined,
    shouldCount: props.row?.shouldCount ?? undefined,
    sortOrder: props.row?.sortOrder ?? undefined,
  },
})

const { mutate: createRow, isPending: isCreating } = useCreateElderAllowanceMutation()
const { mutate: updateRow, isPending: isUpdating } = useUpdateElderAllowanceMutation()
const isPending = computed(() => isCreating.value || isUpdating.value)

const onSubmit = handleSubmit((form) => {
  const payload: ElderAllowanceSave = {
    allowanceId: isEdit.value ? props.row?.allowanceId : undefined,
    name: form.name.trim(),
    salePrice: form.salePrice,
    shouldCount: form.shouldCount,
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
          <FormControl><Input placeholder="如：80-89岁" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="salePrice">
        <FormItem>
          <FormLabel required>
            每月补贴（元）
          </FormLabel>
          <FormControl><Input type="number" min="0" step="0.01" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="shouldCount">
        <FormItem>
          <FormLabel>人数</FormLabel>
          <FormControl><Input type="number" min="0" step="1" v-bind="componentField" /></FormControl>
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
    <Button type="submit" class="w-full" :disabled="isPending">
      {{ isPending ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
