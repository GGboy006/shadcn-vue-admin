<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import { EyeIcon, PencilIcon, Trash2Icon } from '@lucide/vue'

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

// 查看走独立 Sheet(已是 Sheet,保留不动)
const isDetailOpen = ref(false)

// 编辑走 FormSheet(DynamicEdit 自带 FormSheet 外壳)
const isEditOpen = ref(false)

// 删除保留 Modal
const isDeleteOpen = ref(false)
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
    showComponent.value = DynamicDeleteContent
    isDeleteOpen.value = true
  }
}
</script>

<template>
  <!-- 操作列:dropdown 触发器 -->
  <DataTableRowActions :items="items" @action="handleAction" />

  <!-- 查看:Sheet(保留原样) -->
  <DynamicDetailSheet v-model:open="isDetailOpen" :unique-code="dynamic.uniqueCode" />

  <!-- 编辑:FormSheet(DynamicEdit 自带响应式外壳) -->
  <DynamicEdit v-model:open="isEditOpen" :dynamic="dynamic" @close="isEditOpen = false" />

  <!-- 删除:保留 Modal -->
  <Modal v-model:open="isDeleteOpen">
    <ModalContent>
      <component
        :is="showComponent"
        :dynamic="dynamic"
        @close="isDeleteOpen = false"
      />
    </ModalContent>
  </Modal>
</template>
