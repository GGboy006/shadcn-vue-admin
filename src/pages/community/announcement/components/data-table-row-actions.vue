<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import { EyeIcon, PencilIcon, Trash2Icon } from '@lucide/vue'

import type { ICommunityNotice } from '@/services/api/community-notice.api'

import { DataTableRowActions } from '@/components/data-table'
import { Modal, ModalContent } from '@/components/prop-ui/modal'
import { useLazyMount } from '@/composables/use-lazy-mount'

import NoticeDeleteContent from './notice-delete.vue'
import NoticeDetailSheet from './notice-detail-sheet.vue'
import NoticeEdit from './notice-edit.vue'

interface DataTableRowActionsProps {
  row: Row<ICommunityNotice>
}
const props = defineProps<DataTableRowActionsProps>()
const notice = computed(() => props.row.original)

// 查看走独立 Sheet(已是 Sheet,保留不动)
const isDetailOpen = ref(false)
const isDetailOpenRendered = useLazyMount(isDetailOpen)
// 编辑走 FormSheet(NoticeEdit 自带 FormSheet 外壳)
const isEditOpen = ref(false)
const isEditOpenRendered = useLazyMount(isEditOpen)
// 删除保留 Modal
const isDeleteOpen = ref(false)
const isDeleteOpenRendered = useLazyMount(isDeleteOpen)
const showComponent = shallowRef<Component | null>(null)

const items = [
  { key: 'view', label: '查看', icon: EyeIcon },
  { key: 'edit', label: '编辑', icon: PencilIcon },
  { key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' as const },
]

function handleAction(key: string) {
  if (key === 'view') {
    isDetailOpen.value = true
  }
  else if (key === 'edit') {
    isEditOpen.value = true
  }
  else if (key === 'delete') {
    showComponent.value = NoticeDeleteContent
    isDeleteOpen.value = true
  }
}
</script>

<template>
  <!-- 操作列:dropdown 触发器 -->
  <DataTableRowActions :items="items" @action="handleAction" />

  <!-- 查看:Sheet(保留原样) -->
  <NoticeDetailSheet v-if="isDetailOpenRendered" v-model:open="isDetailOpen" :unique-code="notice.uniqueCode" />

  <!-- 编辑:FormSheet(NoticeEdit 自带响应式外壳) -->
  <NoticeEdit v-if="isEditOpenRendered" v-model:open="isEditOpen" :notice="notice" @close="isEditOpen = false" />

  <!-- 删除:保留 Modal -->
  <Modal v-if="isDeleteOpenRendered" v-model:open="isDeleteOpen">
    <ModalContent>
      <component
        :is="showComponent"
        :notice="notice"
        @close="isDeleteOpen = false"
      />
    </ModalContent>
  </Modal>
</template>
