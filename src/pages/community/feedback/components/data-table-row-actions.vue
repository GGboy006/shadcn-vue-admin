<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import { CheckIcon, EyeIcon, ReplyIcon, Trash2Icon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { IFeedback } from '@/services/api/feedback.api'

import { DataTableRowActions } from '@/components/data-table'
import { Modal, ModalContent } from '@/components/prop-ui/modal'
import { useUpdateFeedbackStatusMutation } from '@/services/api/feedback.api'

import FeedbackDeleteContent from './feedback-delete.vue'
import FeedbackDetailSheet from './feedback-detail.vue'
import FeedbackReply from './feedback-reply.vue'

interface DataTableRowActionsProps {
  row: Row<IFeedback>
}
const props = defineProps<DataTableRowActionsProps>()
const feedback = computed(() => props.row.original)

const isDetailOpen = ref(false)
const isReplyOpen = ref(false)
const isDeleteOpen = ref(false)
const showComponent = shallowRef<Component | null>(null)

const { mutate: updateStatus, isPending: isStatusPending } = useUpdateFeedbackStatusMutation()

// 未回复时才显示回复;待处理时才显示标记已处理
const items = computed(() => {
  const list: { key: string, label: string, icon: Component, disabled?: boolean, variant?: 'destructive' }[] = [
    { key: 'view', label: '查看', icon: EyeIcon },
  ]
  if (feedback.value.status !== 3) {
    list.push({ key: 'reply', label: '回复', icon: ReplyIcon })
  }
  if (feedback.value.status === 1) {
    list.push({ key: 'markProcessed', label: '标记已处理', icon: CheckIcon, disabled: isStatusPending.value })
  }
  list.push({ key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' as const })
  return list
})

function handleAction(key: string) {
  if (key === 'view') {
    isDetailOpen.value = true
  }
  else if (key === 'reply') {
    isReplyOpen.value = true
  }
  else if (key === 'markProcessed') {
    updateStatus(
      { feedbackId: feedback.value.feedbackId, status: 2 },
      {
        onSuccess: () => toast.success('已标记为已处理'),
        onError: (err: any) => toast.error(err.message || '操作失败'),
      },
    )
  }
  else if (key === 'delete') {
    showComponent.value = FeedbackDeleteContent
    isDeleteOpen.value = true
  }
}
</script>

<template>
  <DataTableRowActions :items="items" @action="handleAction" />

  <!-- 查看:Modal -->
  <FeedbackDetailSheet v-model:open="isDetailOpen" :feedback-id="feedback.feedbackId" />

  <!-- 回复:Modal -->
  <FeedbackReply v-model:open="isReplyOpen" :feedback="feedback" @close="isReplyOpen = false" />

  <!-- 删除:Modal -->
  <Modal v-model:open="isDeleteOpen">
    <ModalContent>
      <component
        :is="showComponent"
        :feedback="feedback"
        @close="isDeleteOpen = false"
      />
    </ModalContent>
  </Modal>
</template>
