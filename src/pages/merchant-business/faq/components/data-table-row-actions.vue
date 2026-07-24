<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import { EllipsisIcon, PencilIcon } from '@lucide/vue'

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
type TCommand = 'edit' | 'delete'

function handleSelect(command: TCommand) {
  showComponent.value = command === 'edit' ? FaqEdit : FaqDelete
  isOpen.value = true
}
</script>

<template>
  <Modal v-model:open="isOpen">
    <UiDropdownMenu>
      <UiDropdownMenuTrigger as-child>
        <UiButton
          variant="ghost"
          class="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <EllipsisIcon class="size-4" />
          <span class="sr-only">Open menu</span>
        </UiButton>
      </UiDropdownMenuTrigger>
      <UiDropdownMenuContent align="end" class="w-[180px]">
        <UiDropdownMenuItem @click.stop="handleSelect('edit')">
          <PencilIcon class="size-4 mr-2" />
          编辑
        </UiDropdownMenuItem>

        <UiDropdownMenuSeparator />

        <UiDropdownMenuItem
          class="text-destructive focus:text-destructive"
          @click.stop="handleSelect('delete')"
        >
          删除
          <UiDropdownMenuShortcut>⌘⌫</UiDropdownMenuShortcut>
        </UiDropdownMenuItem>
      </UiDropdownMenuContent>
    </UiDropdownMenu>

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
