<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { INeighborhoodCate, INeighborhoodCateAddDTO, INeighborhoodCateUpdateDTO } from '@/services/api/neighborhood-cate.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateCateMutation, useUpdateCateMutation } from '@/services/api/neighborhood-cate.api'
import { showInvalidSubmitToast } from '@/validators/common'

import type { CateValidator } from '../validators/cate.validator'

import { cateValidator } from '../validators/cate.validator'

const { cate } = defineProps<{
  cate?: INeighborhoodCate
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const enableStatusList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const isEdit = computed(() => !!cate?.uniqueCode)

const initialValues = reactive<CateValidator>({
  uniqueCode: cate?.uniqueCode || undefined,
  name: cate?.name || '',
  torder: cate?.torder ?? undefined,
  isEnable: cate?.isEnable ?? 1,
})

const formSchema = toTypedSchema(cateValidator)
const { handleSubmit } = useForm({
  validationSchema: formSchema,
  initialValues,
})

const { mutate: createMutate, isPending: isCreating } = useCreateCateMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdateCateMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

function buildPayload(values: CateValidator): INeighborhoodCateAddDTO | INeighborhoodCateUpdateDTO {
  const basePayload = {
    name: values.name,
    torder: values.torder ?? undefined,
    isEnable: values.isEnable as 1 | 2 | undefined,
  }

  if (isEdit.value && cate) {
    return {
      uniqueCode: cate.uniqueCode,
      ...basePayload,
    } as INeighborhoodCateUpdateDTO
  }

  return basePayload as INeighborhoodCateAddDTO
}

const onSubmit = handleSubmit((values) => {
  const payload = buildPayload(values)

  if (isEdit.value && cate) {
    updateMutate(payload as INeighborhoodCateUpdateDTO, {
      onSuccess: () => {
        toast.success('更新成功')
        emits('close')
      },
      onError: (err: any) => {
        toast.error(err.message || '更新失败')
      },
    })
  }
  else {
    createMutate(payload as INeighborhoodCateAddDTO, {
      onSuccess: () => {
        toast.success('创建成功')
        emits('close')
      },
      onError: (err: any) => {
        toast.error(err.message || '创建失败')
      },
    })
  }
}, showInvalidSubmitToast)
</script>

<template>
  <form class="space-y-6" @submit="onSubmit">
    <!-- 分类名称 -->
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel required>
          分类名称
        </FormLabel>
        <FormControl>
          <Input type="text" placeholder="请输入分类名称" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 排序 -->
    <FormField v-slot="{ componentField }" name="torder">
      <FormItem>
        <FormLabel>排序</FormLabel>
        <FormControl>
          <Input type="number" placeholder="数值越小越靠前" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 启用状态 -->
    <FormField v-slot="{ componentField }" name="isEnable">
      <FormItem>
        <FormLabel>启用状态</FormLabel>
        <Select v-bind="componentField">
          <FormControl>
            <SelectTrigger class="w-full">
              <SelectValue placeholder="请选择" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem v-for="s in enableStatusList" :key="s.value" :value="s.value">
              {{ s.label }}
            </SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    </FormField>

    <Button type="submit" class="w-full" :disabled="isSubmitting">
      {{ isSubmitting ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
