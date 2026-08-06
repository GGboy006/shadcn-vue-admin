<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import { DataTableRowActions } from '@/components/data-table'
import { Modal, ModalContent } from '@/components/prop-ui/modal'

import type { Category } from '../data/schema'

import CategoryDelete from './category-delete.vue'
import CategoryEdit from './category-edit.vue'

interface DataTableRowActionsProps {
  row: Row<Category>
}
const props = defineProps<DataTableRowActionsProps>()
const category = computed(() => props.row.original)

const isOpen = ref(false)
const showComponent = shallowRef<Component | null>(null)
type TCommand = 'edit' | 'delete'

function handleSelect(command: TCommand) {
  showComponent.value = command === 'edit' ? CategoryEdit : CategoryDelete
  isOpen.value = true
}
</script>

<template>
  <Modal v-model:open="isOpen">
    <DataTableRowActions
      :show-view="false"
      content-width="w-[180px]"
      @edit="handleSelect('edit')"
      @delete="handleSelect('delete')"
    />
    <ModalContent>
      <component
        :is="showComponent"
        :context="category.uniqueCode ? { cateCode: category.uniqueCode, initialValues: { name: category.name, torder: category.torder } } : undefined"
        :category="category"
        @close="isOpen = false"
      />
    </ModalContent>
  </Modal>
</template>
