<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import type { HealthBookSave } from '@/services/api/neighborhood-resident.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useGetHealthBookQuery, useUpdateHealthBookMutation } from '@/services/api/neighborhood-resident.api'
import { optionalNumber, optionalString } from '@/validators/common'

const typeOptions = [
  { value: 1, label: '外部 H5' },
  { value: 2, label: '微信小程序' },
] as const
const statusOptions = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const { data, isLoading } = useGetHealthBookQuery()
const { handleSubmit, resetForm, values } = useForm({
  validationSchema: toTypedSchema(z.object({
    type: optionalNumber.refine((value): value is number => value === 1 || value === 2, '请选择挂号方式'),
    status: optionalNumber,
    externalUrl: optionalString,
    name: optionalString,
    remark: optionalString,
    intro: optionalString,
  })),
  initialValues: {
    type: undefined,
    status: 1,
    externalUrl: '',
    name: '',
    remark: '',
    intro: '',
  },
})

watch(data, () => {
  const row = data.value?.data
  resetForm({
    values: {
      type: row?.type ?? undefined,
      status: row?.status ?? 1,
      externalUrl: row?.externalUrl ?? '',
      name: row?.name ?? '',
      remark: row?.remark ?? '',
      intro: row?.intro ?? '',
    },
  })
}, { immediate: true })

const { mutate, isPending } = useUpdateHealthBookMutation()
const onSubmit = handleSubmit((form) => {
  const type = form.type === 2 ? 2 : 1
  const payload: HealthBookSave = {
    type,
    status: form.status === 2 ? 2 : 1,
    externalUrl: type === 1 ? form.externalUrl?.trim() || undefined : undefined,
    name: type === 2 ? form.name?.trim() || undefined : undefined,
    remark: type === 2 ? form.remark?.trim() || undefined : undefined,
    intro: form.intro?.trim() || undefined,
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
      一个村只保留一条挂号配置。居民端只打开启用的这一条。
    </p>
    <div class="grid gap-4 sm:grid-cols-2">
      <FormField v-slot="{ componentField }" name="type">
        <FormItem>
          <FormLabel required>
            挂号方式
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
      <FormField v-if="Number(values.type) === 1" v-slot="{ componentField }" name="externalUrl">
        <FormItem class="sm:col-span-2">
          <FormLabel>H5 地址</FormLabel>
          <FormControl><Input placeholder="https://" v-bind="componentField" /></FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <template v-if="Number(values.type) === 2">
        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>小程序名称</FormLabel>
            <FormControl><Input v-bind="componentField" /></FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="remark">
          <FormItem>
            <FormLabel>小程序路径</FormLabel>
            <FormControl><Input v-bind="componentField" /></FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </template>
    </div>
    <FormField v-slot="{ componentField }" name="intro">
      <FormItem>
        <FormLabel>预约说明</FormLabel>
        <FormControl><Textarea rows="3" v-bind="componentField" /></FormControl>
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
