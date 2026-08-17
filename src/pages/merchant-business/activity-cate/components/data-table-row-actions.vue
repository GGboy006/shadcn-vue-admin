<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { DataTableRowActions, useRowActions } from '@/components/data-table'
import { FormSheet, FormSheetContent } from '@/components/prop-ui/form-sheet'
import { Modal, ModalContent } from '@/components/prop-ui/modal'
import { useLazyMount } from '@/composables/use-lazy-mount'

import type { ActivityCate } from '../data/schema'

import CategoryDelete from './category-delete.vue'
import CategoryEdit from './category-edit.vue'

interface DataTableRowActionsProps {
  row: Row<ActivityCate>
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
  <!-- 操作列:dropdown 触发器 -->
  <DataTableRowActions
    :items="items"
    content-width="w-[180px]"
    @action="handleAction"
  />

  <!-- 编辑:FormSheet(桌面右侧抽屉 / 移动底部抽屉) -->
  <FormSheet v-if="isEditOpenRendered" v-model:open="isEditOpen">
    <FormSheetContent>
      <CategoryEdit
        :context="category.uniqueCode ? { cateCode: category.uniqueCode, initialValues: { name: category.name, torder: category.torder } } : undefined"
        @close="isEditOpen = false"
      />
    </FormSheetContent>
  </FormSheet>

  <!-- 删除:保留 Modal(按需求暂不改) -->
  <Modal v-if="isDeleteOpenRendered" v-model:open="isDeleteOpen">
    <ModalContent>
      <CategoryDelete :category="category" @close="isDeleteOpen = false" />
    </ModalContent>
  </Modal>
</template>
