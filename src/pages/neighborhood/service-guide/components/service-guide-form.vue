<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { INeighborhoodServiceGuide, INeighborhoodServiceGuideAddDTO, INeighborhoodServiceGuideUpdateDTO } from '@/services/api/neighborhood-service-guide.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateServiceGuideMutation, useUpdateServiceGuideMutation } from '@/services/api/neighborhood-service-guide.api'
import { CONTACT_PHONE_MAX_LENGTH, showInvalidSubmitToast } from '@/validators/common'

import type { ServiceGuideValidator } from '../validators/service-guide.validator'

import { serviceGuideValidator } from '../validators/service-guide.validator'

const { guide } = defineProps<{
  guide?: INeighborhoodServiceGuide
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const enableList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const isEdit = computed(() => !!guide?.uniqueCode)

const initialValues = reactive<ServiceGuideValidator>({
  uniqueCode: guide?.uniqueCode || undefined,
  unit: guide?.unit || '',
  address: guide?.address || '',
  phone: guide?.phone || '',
  describe: guide?.describe || '',
  torder: guide?.torder ?? undefined,
  isEnable: guide?.isEnable ?? 1,
})

const formSchema = toTypedSchema(serviceGuideValidator)
const { handleSubmit } = useForm({
  validationSchema: formSchema,
  initialValues,
})

const { mutate: createMutate, isPending: isCreating } = useCreateServiceGuideMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdateServiceGuideMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

function buildPayload(values: ServiceGuideValidator): INeighborhoodServiceGuideAddDTO | INeighborhoodServiceGuideUpdateDTO {
  const basePayload = {
    unit: values.unit || undefined,
    address: values.address || undefined,
    phone: values.phone || undefined,
    describe: values.describe || undefined,
    torder: values.torder ?? undefined,
    isEnable: values.isEnable as 1 | 2 | undefined,
  }

  if (isEdit.value && guide) {
    return {
      uniqueCode: guide.uniqueCode,
      ...basePayload,
    } as INeighborhoodServiceGuideUpdateDTO
  }

  return basePayload as INeighborhoodServiceGuideAddDTO
}

const onSubmit = handleSubmit((values) => {
  const payload = buildPayload(values)

  if (isEdit.value && guide) {
    updateMutate(payload as INeighborhoodServiceGuideUpdateDTO, {
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
    createMutate(payload as INeighborhoodServiceGuideAddDTO, {
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
    <!-- 单位 + 电话 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="unit">
        <FormItem>
          <FormLabel>单位</FormLabel>
          <FormControl>
            <Input type="text" placeholder="请输入单位名称" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="phone">
        <FormItem>
          <FormLabel>电话</FormLabel>
          <FormControl>
            <Input type="tel" :maxlength="CONTACT_PHONE_MAX_LENGTH" placeholder="支持手机号或固话" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <!-- 地址 -->
    <FormField v-slot="{ componentField }" name="address">
      <FormItem>
        <FormLabel>地址</FormLabel>
        <FormControl>
          <Input type="text" placeholder="请输入地址" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 描述 -->
    <FormField v-slot="{ componentField }" name="describe">
      <FormItem>
        <FormLabel>描述</FormLabel>
        <FormControl>
          <Textarea v-bind="componentField" placeholder="请输入描述" rows="3" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 排序 + 启用状态 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-slot="{ componentField }" name="torder">
        <FormItem>
          <FormLabel>排序</FormLabel>
          <FormControl>
            <Input type="number" placeholder="数值越小越靠前" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="isEnable">
        <FormItem>
          <FormLabel>启用状态</FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue placeholder="选择" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="s in enableList" :key="s.value" :value="s.value">
                  {{ s.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <Button type="submit" class="w-full" :disabled="isSubmitting">
      {{ isSubmitting ? '保存中...' : '保存' }}
    </Button>
  </form>
</template>
