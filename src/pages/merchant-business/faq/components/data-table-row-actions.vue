<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import { DataTableRowActions, useRowActions } from '@/components/data-table'
import { Modal, ModalContent } from '@/components/prop-ui/modal'

import type { Faq } from '../data/schema'

import FaqDelete from './faq-delete.vue'
import FaqEdit from './faq-edit.vue'

interface DataTableRowActionsProps {
  row: Row<Faq>
}
const props = defineProps<DataTableRowActionsProps>()
const faq = computed(() => props.row.original)

const isOpen = ref(false)
const showComponent = shallowRef<Component | null>(null)

function handleEdit() {
  showComponent.value = FaqEdit
  isOpen.value = true
}
function handleDelete() {
  showComponent.value = FaqDelete
  isOpen.value = true
}
const { items, handleAction } = useRowActions({ edit: handleEdit, delete: handleDelete })
</script>

<template>
  <Modal v-model:open="isOpen">
    <DataTableRowActions
      :items="items"
      content-width="w-[180px]"
      @action="handleAction"
    />
    <ModalContent>
      <component
        :is="showComponent"
        :context="faq.uniqueCode ? { faqCode: faq.uniqueCode, initialValues: { categoryName: faq.categoryName, question: faq.question, answer: faq.answer, torder: faq.torder, isEnable: faq.isEnable } } : undefined"
        :faq="faq"
        @close="isOpen = false"
      />
    </ModalContent>
  </Modal>
</template>
