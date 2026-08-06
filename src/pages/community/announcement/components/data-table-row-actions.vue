<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import type { ICommunityNotice } from '@/services/api/community-notice.api'

import { DataTableRowActions } from '@/components/data-table'
import { Modal, ModalContent } from '@/components/prop-ui/modal'

import NoticeDeleteContent from './notice-delete.vue'
import NoticeDetailSheet from './notice-detail-sheet.vue'
import NoticeEdit from './notice-edit.vue'

interface DataTableRowActionsProps {
  row: Row<ICommunityNotice>
}
const props = defineProps<DataTableRowActionsProps>()
const notice = computed(() => props.row.original)

const isOpen = ref(false)
const isDetailOpen = ref(false)

const showComponent = shallowRef<Component | null>(null)
type TCommand = 'edit' | 'delete'

function handleSelect(command: TCommand) {
  showComponent.value = command === 'edit' ? NoticeEdit : NoticeDeleteContent
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
        :notice="notice"
        @close="isOpen = false"
      />
    </ModalContent>
  </Modal>

  <NoticeDetailSheet
    v-model:open="isDetailOpen"
    :unique-code="notice.uniqueCode"
  />
</template>
