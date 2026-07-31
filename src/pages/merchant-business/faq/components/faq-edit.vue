<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import { ModalClose, ModalFooter, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCurrentMerchantId } from '@/composables/use-current-merchant-id'
import { useCreateFaqMutation, useUpdateFaqMutation } from '@/services/api/merchant-business.api'
import { optionalInt, showInvalidSubmitToast } from '@/validators/common'

import type { FaqFormValues } from '../data/schema'

import { buildFaqPayload } from '../data/payload'

const props = defineProps<{
  context?: {
    faqCode?: string
    initialValues?: FaqFormValues
  }
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const isEdit = computed(() => !!props.context?.faqCode)

const faqSchema = z.object({
  categoryName: z.string().optional(),
  question: z.string().min(1, '问题不能为空'),
  answer: z.string().min(1, '答案不能为空'),
  torder: optionalInt,
  isEnable: z.number().optional(),
})

const initialValues = reactive<FaqFormValues>({
  categoryName: props.context?.initialValues?.categoryName ?? '',
  question: props.context?.initialValues?.question ?? '',
  answer: props.context?.initialValues?.answer ?? '',
  torder: props.context?.initialValues?.torder,
  isEnable: props.context?.initialValues?.isEnable ?? 1,
})

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(faqSchema),
  initialValues,
})

const statusList = [
  { value: 1, label: '启用' },
  { value: 2, label: '禁用' },
] as const

const { merchantId } = useCurrentMerchantId()
const { mutate: createMutate, isPending: isCreating } = useCreateFaqMutation(merchantId)
const { mutate: updateMutate, isPending: isUpdating } = useUpdateFaqMutation(merchantId)

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

const onSubmit = handleSubmit((values) => {
  const payload = buildFaqPayload(values as FaqFormValues, props.context?.faqCode)

  if (isEdit.value && props.context?.faqCode) {
    updateMutate(payload as never, {
      onSuccess: () => {
        toast.success('更新成功')
        emits('close')
      },
      onError: (err: any) => toast.error(err.message || '更新失败'),
    })
  }
  else {
    createMutate(payload as never, {
      onSuccess: () => {
        toast.success('创建成功')
        emits('close')
      },
      onError: (err: any) => toast.error(err.message || '创建失败'),
    })
  }
}, showInvalidSubmitToast)
</script>

<template>
  <form @submit="onSubmit">
    <ModalHeader>
      <ModalTitle>{{ isEdit ? '编辑FAQ' : '新建FAQ' }}</ModalTitle>
    </ModalHeader>

    <div class="space-y-4 py-4">
      <FormField v-slot="{ componentField }" name="categoryName">
        <FormItem>
          <FormLabel>标签</FormLabel>
          <FormControl>
            <Input type="text" v-bind="componentField" placeholder="如:退换政策" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="question">
        <FormItem>
          <FormLabel required>
            问题
          </FormLabel>
          <FormControl>
            <Input type="text" v-bind="componentField" placeholder="请输入问题" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="answer">
        <FormItem>
          <FormLabel required>
            答案
          </FormLabel>
          <FormControl>
            <Textarea v-bind="componentField" placeholder="请输入答案" rows="4" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <div class="grid grid-cols-2 gap-4">
        <FormField v-slot="{ componentField }" name="torder">
          <FormItem>
            <FormLabel>排序</FormLabel>
            <FormControl>
              <Input type="number" v-bind="componentField" placeholder="数字越小越靠前" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="isEnable">
          <FormItem>
            <FormLabel>状态</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="s in statusList" :key="s.value" :value="s.value">
                    {{ s.label }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
    </div>

    <ModalFooter>
      <ModalClose as-child>
        <Button variant="outline">
          取消
        </Button>
      </ModalClose>
      <Button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? '保存中...' : '保存' }}
      </Button>
    </ModalFooter>
  </form>
</template>
