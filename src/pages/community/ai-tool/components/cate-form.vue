<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type {
  IResidentAiToolCate,
  IResidentAiToolCateAddDTO,
  IResidentAiToolCateUpdateDTO,
  ResidentAiToolEnableStatus,
} from '@/services/api/resident-ai-tool.api'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  useCreateResidentAiToolCateMutation,
  useUpdateResidentAiToolCateMutation,
} from '@/services/api/resident-ai-tool.api'
import { showInvalidSubmitToast } from '@/validators/common'

import type { ResidentAiToolCateValidator } from '../validators/ai-tool-cate.validator'

import { residentAiToolCateValidator } from '../validators/ai-tool-cate.validator'

const { cate } = defineProps<{
  cate?: IResidentAiToolCate
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const enableList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const isEdit = computed(() => !!cate?.uniqueCode)

const initialValues = reactive<ResidentAiToolCateValidator>({
  uniqueCode: cate?.uniqueCode || undefined,
  name: cate?.name || '',
  parentCode: cate?.parentCode || '',
  describe: cate?.describe || '',
  torder: cate?.torder ?? undefined,
  isEnable: cate?.isEnable ?? 1,
})

const formSchema = toTypedSchema(residentAiToolCateValidator)
const { handleSubmit } = useForm({
  validationSchema: formSchema,
  initialValues,
})

const { mutate: createMutate, isPending: isCreating } = useCreateResidentAiToolCateMutation()
const { mutate: updateMutate, isPending: isUpdating } = useUpdateResidentAiToolCateMutation()

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

function buildPayload(values: ResidentAiToolCateValidator): IResidentAiToolCateAddDTO {
  return {
    name: values.name,
    parentCode: values.parentCode || undefined,
    describe: values.describe || undefined,
    torder: values.torder ?? undefined,
    isEnable: values.isEnable as ResidentAiToolEnableStatus | undefined,
  }
}

const onSubmit = handleSubmit((values) => {
  const payload = buildPayload(values)

  if (isEdit.value && cate) {
    updateMutate({ ...payload, uniqueCode: cate.uniqueCode } as IResidentAiToolCateUpdateDTO, {
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
    createMutate(payload, {
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
    <!-- 名称 -->
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel required>
          分类名称
        </FormLabel>
        <FormControl>
          <Input type="text" placeholder="请输入分类名称,如「生活助手」" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 描述 -->
    <FormField v-slot="{ componentField }" name="describe">
      <FormItem>
        <FormLabel>描述</FormLabel>
        <FormControl>
          <Textarea v-bind="componentField" placeholder="请输入分类描述" rows="2" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- 父级编码 + 排序 + 启用状态 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <FormField v-slot="{ componentField }" name="parentCode">
        <FormItem>
          <FormLabel>父级编码</FormLabel>
          <FormControl>
            <Input type="text" placeholder="顶级留空" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

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
