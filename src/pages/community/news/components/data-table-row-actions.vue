<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import type { ICommunityDynamic } from '@/services/api/community-dynamic.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'
import { Modal, ModalContent } from '@/components/prop-ui/modal'

import DynamicDeleteContent from './dynamic-delete.vue'
import DynamicDetailSheet from './dynamic-detail-sheet.vue'
import DynamicEdit from './dynamic-edit.vue'

interface DataTableRowActionsProps {
  row: Row<ICommunityDynamic>
}
const props = defineProps<DataTableRowActionsProps>()
const dynamic = computed(() => props.row.original)

const isOpen = ref(false)
const isDetailOpen = ref(false)

const showComponent = shallowRef<Component | null>(null)

function handleEdit() {
  showComponent.value = DynamicEdit
  isOpen.value = true
}
function handleDelete() {
  showComponent.value = DynamicDeleteContent
  isOpen.value = true
}
const { items, handleAction } = useRowActions({
  view: () => { isDetailOpen.value = true },
  edit: handleEdit,
  delete: handleDelete,
})
</script>

<template>
  <Modal v-model:open="isOpen">
    <DataTableRowActions :items="items" @action="handleAction" />
    <ModalContent>
      <component
        :is="showComponent"
        :dynamic="dynamic"
        @close="isOpen = false"
      />
    </ModalContent>
  </Modal>

  <DynamicDetailSheet
    v-model:open="isDetailOpen"
    :unique-code="dynamic.uniqueCode"
  />
</template>
