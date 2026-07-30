<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import { EllipsisIcon, EyeIcon, PencilIcon } from '@lucide/vue'

import type { ICommunityDynamic } from '@/services/api/community-dynamic.api'

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
type TCommand = 'edit' | 'delete'

function handleSelect(command: TCommand) {
  showComponent.value = command === 'edit' ? DynamicEdit : DynamicDeleteContent
  isOpen.value = true
}

function handleView() {
  isDetailOpen.value = true
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
      <UiDropdownMenuContent align="end" class="w-[160px]">
        <UiDropdownMenuItem @click.stop="handleView">
          <EyeIcon class="size-4 mr-2" />
          查看
        </UiDropdownMenuItem>

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
