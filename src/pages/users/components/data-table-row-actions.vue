<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import { DataTableRowActions, useRowActions } from '@/components/data-table'
import { Modal, ModalContent } from '@/components/prop-ui/modal'

import type { User } from '../data/schema'

interface DataTableRowActionsProps {
  row: Row<User>
}
const props = defineProps<DataTableRowActionsProps>()
const user = computed(() => props.row.original)
const isOpen = ref(false)

const showComponent = shallowRef<Component | null>(null)
type TCommand = 'edit' | 'delete'

const componentLoader: Record<TCommand, () => Promise<{ default: Component }>> = {
  edit: () => import('./user-resource.vue'),
  delete: () => import('./user-delete.vue'),
}

async function handleSelect(command: TCommand) {
  try {
    const { default: component } = await componentLoader[command]()
    showComponent.value = component
    isOpen.value = true
  }
  catch (e) {
    console.error(`Failed to load component for "${command}"`, e)
  }
}

const { items, handleAction } = useRowActions({
  edit: () => handleSelect('edit'),
  delete: () => handleSelect('delete'),
})
</script>

<template>
  <Modal v-model:open="isOpen">
    <DataTableRowActions :items="items" @action="handleAction" />
    <ModalContent>
      <component :is="showComponent" :user="user" @close="isOpen = false" />
    </ModalContent>
  </Modal>
</template>
