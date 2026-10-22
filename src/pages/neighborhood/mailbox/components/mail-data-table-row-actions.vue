<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { CircleCheckIcon, EyeIcon, ReplyIcon, Trash2Icon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { RowActionItem } from '@/components/data-table'
import type { MailMessage } from '@/services/api/neighborhood-resident.api'

import { DataTableRowActions } from '@/components/data-table'
import { useLazyMount } from '@/composables/use-lazy-mount'
import { useDeleteMailMutation, useFinishMailMutation } from '@/services/api/neighborhood-resident.api'

import GovConfirmDialog from '../../components/gov-confirm-dialog.vue'
import GovDeleteDialog from '../../components/gov-delete-dialog.vue'
import GovFormSheet from '../../components/gov-form-sheet.vue'
import MailDetail from './mail-detail.vue'
import MailReplyForm from './mail-reply-form.vue'

const props = defineProps<{ row: Row<MailMessage> }>()
const record = computed(() => props.row.original)
const isDetailOpen = ref(false)
const isDetailRendered = useLazyMount(isDetailOpen)
const isReplyOpen = ref(false)
const isReplyRendered = useLazyMount(isReplyOpen)
const isFinishOpen = ref(false)
const isFinishRendered = useLazyMount(isFinishOpen)
const isDeleteOpen = ref(false)
const isDeleteRendered = useLazyMount(isDeleteOpen)
const { mutate: finishMail, isPending: isFinishing } = useFinishMailMutation()
const { mutate: removeRow, isPending: isDeleting } = useDeleteMailMutation()
const items = computed(() => {
  const next: RowActionItem[] = [
    { key: 'detail', label: '详情', icon: EyeIcon },
    { key: 'reply', label: '回复', icon: ReplyIcon },
  ]
  if (record.value.status !== 3)
    next.push({ key: 'finish', label: '办结', icon: CircleCheckIcon })
  next.push({ key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' })
  return next
})

function handleAction(key: string) {
  if (key === 'detail')
    isDetailOpen.value = true
  else if (key === 'reply')
    isReplyOpen.value = true
  else if (key === 'finish')
    isFinishOpen.value = true
  else if (key === 'delete')
    isDeleteOpen.value = true
}

function confirmFinish() {
  finishMail(record.value.mailId, {
    onSuccess: () => {
      toast.success('已办结')
      isFinishOpen.value = false
    },
    onError: (err: Error) => toast.error(err.message || '办结失败'),
  })
}

function confirmDelete() {
  removeRow(record.value.mailId, {
    onSuccess: () => {
      toast.success('已删除')
      isDeleteOpen.value = false
    },
    onError: (err: Error) => toast.error(err.message || '删除失败'),
  })
}
</script>

<template>
  <DataTableRowActions :items="items" @action="handleAction" />

  <GovFormSheet v-if="isDetailRendered" v-model:open="isDetailOpen" title="来信详情">
    <MailDetail v-if="isDetailOpen" :mail-id="record.mailId" />
  </GovFormSheet>

  <GovFormSheet v-if="isReplyRendered" v-model:open="isReplyOpen" title="回复来信">
    <MailReplyForm v-if="isReplyOpen" :key="record.mailId" :mail="record" @close="isReplyOpen = false" />
  </GovFormSheet>

  <GovConfirmDialog
    v-if="isFinishRendered"
    v-model:open="isFinishOpen"
    title="办结这封来信"
    description="办结后状态变为已办结。"
    confirm-text="办结"
    :pending="isFinishing"
    @confirm="confirmFinish"
  />

  <GovDeleteDialog
    v-if="isDeleteRendered"
    v-model:open="isDeleteOpen"
    :title="`删除 ${record.name || record.code || '这封来信'}`"
    :pending="isDeleting"
    @confirm="confirmDelete"
  />
</template>
