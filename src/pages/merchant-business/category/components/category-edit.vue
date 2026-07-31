<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import { ModalClose, ModalFooter, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useCurrentMerchantId } from '@/composables/use-current-merchant-id'
import { useCreateCateMutation, useUpdateCateMutation } from '@/services/api/merchant-business.api'
import { optionalInt, showInvalidSubmitToast } from '@/validators/common'

import type { CategoryEditContext, CategoryFormValues } from '../data/schema'

import { buildCategoryPayload } from '../data/payload'

const props = defineProps<{
  context?: CategoryEditContext
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const isEdit = computed(() => !!props.context?.cateCode)

const categorySchema = z.object({
  name: z.string().min(1, '分类名称不能为空'),
  torder: optionalInt,
})

const initialValues = reactive<CategoryFormValues>({
  name: props.context?.initialValues?.name ?? '',
  torder: props.context?.initialValues?.torder,
})

const { handleSubmit, isSubmitting: _isSubmitting } = useForm({
  validationSchema: toTypedSchema(categorySchema),
  initialValues,
})

const { merchantId } = useCurrentMerchantId()
const { mutate: createMutate, isPending: isCreating } = useCreateCateMutation(merchantId)
const { mutate: updateMutate, isPending: isUpdating } = useUpdateCateMutation(merchantId)

const isSubmitting = computed(() => isCreating.value || isUpdating.value)

const onSubmit = handleSubmit((values) => {
  const payload = buildCategoryPayload(values, props.context?.cateCode)

  if (isEdit.value && props.context?.cateCode) {
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
      <ModalTitle>{{ isEdit ? '编辑分类' : '新建分类' }}</ModalTitle>
    </ModalHeader>

    <div class="space-y-4 py-4">
      <FormField v-slot="{ componentField }" name="name">
        <FormItem>
          <FormLabel required>
            分类名称
          </FormLabel>
          <FormControl>
            <Input type="text" v-bind="componentField" placeholder="请输入分类名称" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="torder">
        <FormItem>
          <FormLabel>排序</FormLabel>
          <FormControl>
            <Input type="number" v-bind="componentField" placeholder="数字越小越靠前" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
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
