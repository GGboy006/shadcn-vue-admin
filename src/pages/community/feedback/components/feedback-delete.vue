<script lang="ts" setup>
import { LoaderIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { IFeedback } from '@/services/api/feedback.api'

import { ModalClose, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'
import { Button } from '@/components/ui/button'
import { useDeleteFeedbackMutation } from '@/services/api/feedback.api'

const { feedback } = defineProps<{
  feedback: IFeedback
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const { mutate, isPending } = useDeleteFeedbackMutation()

function handleRemove() {
  mutate(feedback.feedbackId, {
    onSuccess: () => {
      toast.success('删除成功')
      emits('close')
    },
    onError: (err: any) => {
      toast.error(err.message || '删除失败')
    },
  })
}
</script>

<template>
  <div>
    <ModalHeader>
      <ModalTitle>
        删除意见反馈?
      </ModalTitle>

      <ModalDescription>
        您即将删除来自「{{ feedback.userName || '匿名用户' }}」的反馈，此操作不可撤销。
      </ModalDescription>
    </ModalHeader>

    <ModalFooter>
      <ModalClose as-child>
        <Button variant="outline">
          取消
        </Button>
      </ModalClose>

      <Button variant="destructive" :disabled="isPending" @click="handleRemove">
        <LoaderIcon v-if="isPending" class="mr-1 size-4 animate-spin" />
        {{ isPending ? '删除中...' : '删除' }}
      </Button>
    </ModalFooter>
  </div>
</template>
