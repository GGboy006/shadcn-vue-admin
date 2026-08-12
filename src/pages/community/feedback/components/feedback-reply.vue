<script setup lang="ts">
import { LoaderIcon } from '@lucide/vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { computed } from 'vue'
import { toast } from 'vue-sonner'

import type { IFeedback } from '@/services/api/feedback.api'

import { ModalClose, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useReplyFeedbackMutation } from '@/services/api/feedback.api'
import { showInvalidSubmitToast } from '@/validators/common'

import { feedbackReplyValidator } from '../validators/feedback.validator'

const props = defineProps<{
  open: boolean
  feedback: IFeedback
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'close': []
}>()

const isOpen = computed({
  get: () => props.open,
  set: (val) => {
    emit('update:open', val)
    if (!val)
      emit('close')
  },
})

const formSchema = toTypedSchema(feedbackReplyValidator)
const { handleSubmit, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: { replyContent: '' },
})

const { mutate, isPending } = useReplyFeedbackMutation()

const onSubmit = handleSubmit((values) => {
  mutate(
    { feedbackId: props.feedback.feedbackId, replyContent: values.replyContent },
    {
      onSuccess: () => {
        toast.success('回复成功')
        resetForm()
        isOpen.value = false
      },
      onError: (err: any) => toast.error(err.message || '回复失败'),
    },
  )
}, showInvalidSubmitToast)

// 关闭时重置表单
watch(isOpen, (val) => {
  if (!val)
    resetForm()
})
</script>

<template>
  <Modal v-model:open="isOpen">
    <ModalContent class="sm:max-w-lg">
      <ModalHeader>
        <ModalTitle class="text-base">
          回复意见反馈
        </ModalTitle>
        <ModalDescription>
          回复后将自动置为「已回复」状态。
        </ModalDescription>
      </ModalHeader>

      <div class="space-y-3 px-1">
        <!-- 反馈摘要 -->
        <div class="rounded-md bg-muted p-3 text-sm">
          <div class="mb-1 text-muted-foreground">
            {{ feedback.userName || '匿名用户' }} · {{ feedback.createTime }}
          </div>
          <p class="line-clamp-2 leading-relaxed">
            {{ feedback.content }}
          </p>
        </div>

        <FormField v-slot="{ componentField }" name="replyContent">
          <FormItem>
            <FormLabel required>
              回复内容
            </FormLabel>
            <FormControl>
              <Textarea v-bind="componentField" placeholder="请输入回复内容(≤2000 字)" rows="5" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <ModalFooter>
        <ModalClose as-child>
          <Button variant="outline" :disabled="isPending">
            取消
          </Button>
        </ModalClose>
        <Button :disabled="isPending" @click="onSubmit">
          <LoaderIcon v-if="isPending" class="mr-1 size-4 animate-spin" />
          {{ isPending ? '提交中...' : '确认回复' }}
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
</template>
