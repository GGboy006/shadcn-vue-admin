<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import { DataTableRowActions, useRowActions } from '@/components/data-table'
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

function handleEdit() {
  showComponent.value = CategoryEdit
  isOpen.value = true
}
function handleDelete() {
  showComponent.value = CategoryDelete
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
        :context="category.uniqueCode ? { cateCode: category.uniqueCode, initialValues: { name: category.name, torder: category.torder } } : undefined"
        :category="category"
        @close="isOpen = false"
      />
    </ModalContent>
  </Modal>
</template>
