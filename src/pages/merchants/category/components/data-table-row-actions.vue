<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { DataTableRowActions, useRowActions } from '@/components/data-table'
import { FormSheet, FormSheetContent } from '@/components/prop-ui/form-sheet'
import { Modal, ModalContent } from '@/components/prop-ui/modal'
import { useLazyMount } from '@/composables/use-lazy-mount'

import type { MerchantCategory } from '../data/schema'

import CategoryDelete from './category-delete.vue'
import CategoryEdit from './category-edit.vue'

interface DataTableRowActionsProps {
  row: Row<MerchantCategory>
}
const props = defineProps<DataTableRowActionsProps>()
const category = computed(() => props.row.original)

const isEditOpen = ref(false)
const isEditOpenRendered = useLazyMount(isEditOpen)
const isDeleteOpen = ref(false)
const isDeleteOpenRendered = useLazyMount(isDeleteOpen)

function handleEdit() {
  isEditOpen.value = true
}
function handleDelete() {
  isDeleteOpen.value = true
}
const { items, handleAction } = useRowActions({ edit: handleEdit, delete: handleDelete })
</script>

<template>
  <DataTableRowActions
    :items="items"
    content-width="w-[180px]"
    @action="handleAction"
  />

  <FormSheet v-if="isEditOpenRendered" v-model:open="isEditOpen">
    <FormSheetContent>
      <CategoryEdit
        :context="category.uniqueCode ? { uniqueCode: category.uniqueCode, initialValues: { name: category.name, torder: category.torder, status: category.status } } : undefined"
        @close="isEditOpen = false"
      />
    </FormSheetContent>
  </FormSheet>

  <Modal v-if="isDeleteOpenRendered" v-model:open="isDeleteOpen">
    <ModalContent>
      <CategoryDelete :category="category" @close="isDeleteOpen = false" />
    </ModalContent>
  </Modal>
</template>
