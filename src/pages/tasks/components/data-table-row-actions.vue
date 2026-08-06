<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import { DataTableRowActions } from '@/components/data-table'
import { Modal, ModalContent } from '@/components/prop-ui/modal'

import type { Task } from '../data/schema'

import { labels } from '../data/data'
import { taskSchema } from '../data/schema'

const props = defineProps<DataTableRowActionsProps>()

interface DataTableRowActionsProps {
  row: Row<Task>
}
const task = computed(() => taskSchema.parse(props.row.original))

const taskLabel = ref(task.value.label)

const showComponent = shallowRef<Component | null>(null)
const isOpen = ref(false)

type TCommand = 'edit' | 'create' | 'delete'

const componentLoader: Record<TCommand, () => Promise<{ default: Component }>> = {
  edit: () => import('./task-resource-dialog.vue'),
  create: () => import('./task-resource-dialog.vue'),
  delete: () => import('./task-delete.vue'),
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
</script>

<template>
  <Modal v-model:open="isOpen">
    <DataTableRowActions
      @edit="handleSelect('edit')"
      @delete="handleSelect('delete')"
    >
      <template #extra-items>
        <UiDropdownMenuItem disabled>
          复制
        </UiDropdownMenuItem>
        <UiDropdownMenuItem disabled>
          收藏
        </UiDropdownMenuItem>

        <UiDropdownMenuSeparator />

        <UiDropdownMenuSub>
          <UiDropdownMenuSubTrigger>标签</UiDropdownMenuSubTrigger>
          <UiDropdownMenuSubContent>
            <UiDropdownMenuRadioGroup v-model="taskLabel">
              <UiDropdownMenuRadioItem v-for="label in labels" :key="label.value" :value="label.value">
                {{ label.label }}
              </UiDropdownMenuRadioItem>
            </UiDropdownMenuRadioGroup>
          </UiDropdownMenuSubContent>
        </UiDropdownMenuSub>
      </template>
    </DataTableRowActions>

    <ModalContent>
      <component :is="showComponent" :task="task" @close="isOpen = false" />
    </ModalContent>
  </Modal>
</template>
