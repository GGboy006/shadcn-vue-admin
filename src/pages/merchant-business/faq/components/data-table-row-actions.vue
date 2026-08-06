<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { DataTableRowActions, useRowActions } from '@/components/data-table'
import { FormSheet, FormSheetContent } from '@/components/prop-ui/form-sheet'
import { Modal, ModalContent } from '@/components/prop-ui/modal'

import type { Faq } from '../data/schema'

import FaqDelete from './faq-delete.vue'
import FaqEdit from './faq-edit.vue'

interface DataTableRowActionsProps {
  row: Row<Faq>
}
const props = defineProps<DataTableRowActionsProps>()
const faq = computed(() => props.row.original)

const isEditOpen = ref(false)
const isDeleteOpen = ref(false)

function handleEdit() {
  isEditOpen.value = true
}
function handleDelete() {
  isDeleteOpen.value = true
}
const { items, handleAction } = useRowActions({ edit: handleEdit, delete: handleDelete })
</script>

<template>
  <!-- 操作列:dropdown 触发器 -->
  <DataTableRowActions
    :items="items"
    content-width="w-[180px]"
    @action="handleAction"
  />

  <!-- 编辑:FormSheet(桌面右侧抽屉 / 移动底部抽屉) -->
  <FormSheet v-model:open="isEditOpen">
    <FormSheetContent>
      <FaqEdit
        :context="faq.uniqueCode ? { faqCode: faq.uniqueCode, initialValues: { categoryName: faq.categoryName, question: faq.question, answer: faq.answer, torder: faq.torder, isEnable: faq.isEnable } } : undefined"
        @close="isEditOpen = false"
      />
    </FormSheetContent>
  </FormSheet>

  <!-- 删除:保留 Modal(按需求暂不改) -->
  <Modal v-model:open="isDeleteOpen">
    <ModalContent>
      <FaqDelete :faq="faq" @close="isDeleteOpen = false" />
    </ModalContent>
  </Modal>
</template>
