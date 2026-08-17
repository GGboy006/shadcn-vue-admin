<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import { BanIcon, CircleCheckIcon, PencilIcon, Trash2Icon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { IKnowledgeQuestion } from '@/services/api/knowledge.api'

import { DataTableRowActions } from '@/components/data-table'
import { Modal, ModalContent } from '@/components/prop-ui/modal'
import { useUpdateKnowledgeQuestionStatusMutation } from '@/services/api/knowledge.api'

import QuestionDeleteContent from './question-delete.vue'
import QuestionEdit from './question-edit.vue'

interface DataTableRowActionsProps {
  row: Row<IKnowledgeQuestion>
}
const props = defineProps<DataTableRowActionsProps>()
const question = computed(() => props.row.original)

const isEditOpen = ref(false)
const isDeleteOpen = ref(false)
const showComponent = shallowRef<Component | null>(null)

const { mutate: toggleStatus, isPending: isToggling } = useUpdateKnowledgeQuestionStatusMutation()

// 全站通用数据(editable=false)不可改删
const editable = computed(() => question.value.editable !== false)

const items = computed(() => {
  if (!editable.value)
    return []
  return [
    { key: 'toggleStatus', label: question.value.status === 1 ? '禁用' : '启用', icon: question.value.status === 1 ? BanIcon : CircleCheckIcon, disabled: isToggling.value },
    { key: 'edit', label: '编辑', icon: PencilIcon },
    { key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' as const },
  ]
})

function handleToggleStatus() {
  const next = question.value.status === 1 ? 2 : 1
  toggleStatus({ questionId: question.value.questionId, status: next }, {
    onSuccess: () => {
      toast.success(next === 1 ? '已启用' : '已禁用')
    },
    onError: (err: any) => {
      toast.error(err.message || '操作失败')
    },
  })
}

function handleAction(key: string) {
  if (key === 'toggleStatus') {
    handleToggleStatus()
  }
  else if (key === 'edit') {
    isEditOpen.value = true
  }
  else if (key === 'delete') {
    showComponent.value = QuestionDeleteContent
    isDeleteOpen.value = true
  }
}
</script>

<template>
  <DataTableRowActions :items="items" @action="handleAction" />

  <QuestionEdit v-model:open="isEditOpen" :question="question" @close="isEditOpen = false" />

  <Modal v-model:open="isDeleteOpen">
    <ModalContent>
      <component
        :is="showComponent"
        :question="question"
        @close="isDeleteOpen = false"
      />
    </ModalContent>
  </Modal>
</template>
