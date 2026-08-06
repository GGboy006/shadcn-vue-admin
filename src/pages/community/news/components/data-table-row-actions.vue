<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import type { ICommunityDynamic } from '@/services/api/community-dynamic.api'

import { DataTableRowActions } from '@/components/data-table'
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
    <DataTableRowActions
      @view="handleView"
      @edit="handleSelect('edit')"
      @delete="handleSelect('delete')"
    />
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
