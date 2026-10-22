<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { ElderMealSave } from '@/services/api/neighborhood-resident.api'

import { RichTextEditor } from '@/components/prop-ui/rich-text'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetElderMealQuery, useUpdateElderMealMutation } from '@/services/api/neighborhood-resident.api'
import { optionalNumber, optionalString } from '@/validators/common'

const price = optionalNumber.refine(value => value === undefined || value >= 0, '请填写不小于 0 的金额')
const count = optionalNumber.refine(value => value === undefined || (Number.isInteger(value) && value >= 0), '请填写不小于 0 的整数')

const { data, isLoading } = useGetElderMealQuery()
const { handleSubmit, resetForm, setFieldValue, values } = useForm({
  validationSchema: toTypedSchema(z.object({
    salePrice: price,
    businessHours: optionalString,
    address: optionalString,
    shouldCount: count,
    content: optionalString,
  })),
  initialValues: {
    salePrice: undefined,
    businessHours: '',
    address: '',
    shouldCount: undefined,
    content: '',
  },
})

watch(data, () => {
  const row = data.value?.data
  resetForm({
    values: {
      salePrice: row?.salePrice ?? undefined,
      businessHours: row?.businessHours ?? '',
      address: row?.address ?? '',
      shouldCount: row?.shouldCount ?? undefined,
      content: row?.content ?? '',
    },
  })
}, { immediate: true })

const { mutate, isPending } = useUpdateElderMealMutation()
const onSubmit = handleSubmit((form) => {
  const payload: ElderMealSave = {
    salePrice: form.salePrice,
    businessHours: form.businessHours?.trim() || undefined,
    address: form.address?.trim() || undefined,
    shouldCount: form.shouldCount,
    content: form.content?.trim() || undefined,
  }
  mutate(payload, {
    onSuccess: () => toast.success('已保存'),
    onError: (err: Error) => toast.error(err.message || '保存失败'),
  })
}, (ctx) => {
  const message = Object.values(ctx.errors)[0]
  if (message)
    toast.error(String(message))
})
</script>

<template>
  <div v-if="isLoading" class="space-y-3">
    <Skeleton class="h-8 w-40" />
    <Skeleton class="h-40 w-full" />
  </div>
  <form v-else class="space-y-4" @submit="onSubmit">
    <p class="text-xs text-muted-foreground">
      一个村只保留一条助餐政策。这里不填写政策编号。
    </p>
    <div class="grid gap-4 sm:grid-cols-2">
      <FormField v-slot="{ componentField }" name="salePrice">
        <FormItem>
          <FormLabel>餐标（元）</FormLabel>
          <FormControl><Input type="number" min="0" step="0.01" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="shouldCount">
        <FormItem>
          <FormLabel>供餐人数</FormLabel>
          <FormControl><Input type="number" min="0" step="1" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="businessHours">
        <FormItem>
          <FormLabel>供餐时间</FormLabel>
          <FormControl><Input placeholder="如：每天 11:00-13:00" v-bind="componentField" /></FormControl>
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
    </div>
    <FormField name="content">
      <FormItem>
        <FormLabel>申请条件</FormLabel>
        <FormControl>
          <RichTextEditor
            :model-value="values.content ?? ''"
            placeholder="请输入申请条件"
            :min-height="180"
            @update:model-value="setFieldValue('content', $event ?? '')"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <div class="flex justify-end">
      <Button type="submit" :disabled="isPending">
        {{ isPending ? '保存中...' : '保存' }}
      </Button>
    </div>
  </form>
</template>
