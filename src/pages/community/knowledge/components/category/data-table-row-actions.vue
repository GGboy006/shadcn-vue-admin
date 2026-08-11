<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import { FileTextIcon, PencilIcon, Trash2Icon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { IKnowledgeCategory } from '@/services/api/knowledge.api'

import { DataTableRowActions } from '@/components/data-table'
import { Modal, ModalContent } from '@/components/prop-ui/modal'
import { useUpdateKnowledgeCategoryStatusMutation } from '@/services/api/knowledge.api'

import CategoryDeleteContent from './category-delete.vue'
import CategoryEdit from './category-edit.vue'

interface DataTableRowActionsProps {
  row: Row<IKnowledgeCategory>
}
const props = defineProps<DataTableRowActionsProps>()
const category = computed(() => props.row.original)

const router = useRouter()

const isEditOpen = ref(false)
const isDeleteOpen = ref(false)
const showComponent = shallowRef<Component | null>(null)

const { mutate: toggleStatus, isPending: isToggling } = useUpdateKnowledgeCategoryStatusMutation()

// 全站通用数据(editable=false)不可改删,仅可查看文章
const editable = computed(() => category.value.editable !== false)

const items = computed(() => {
  const list: { key: string, label: string, icon: any, variant?: 'destructive', disabled?: boolean }[] = [
    { key: 'articles', label: '查看文章', icon: FileTextIcon },
  ]
  if (editable.value) {
    list.push({ key: 'toggleStatus', label: category.value.status === 1 ? '禁用' : '启用', icon: PencilIcon, disabled: isToggling.value })
    list.push({ key: 'edit', label: '编辑', icon: PencilIcon })
    list.push({ key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' as const })
  }
  return list
})

function handleToggleStatus() {
  const next = category.value.status === 1 ? 2 : 1
  toggleStatus({ categoryId: category.value.categoryId, status: next }, {
    onSuccess: () => {
      toast.success(next === 1 ? '已启用' : '已禁用')
    },
    onError: (err: any) => {
      toast.error(err.message || '操作失败')
    },
  })
}

function handleViewArticles() {
  router.push(`/community/knowledge/${category.value.categoryId}`)
}

function handleAction(key: string) {
  if (key === 'articles') {
    handleViewArticles()
  }
  else if (key === 'toggleStatus') {
    handleToggleStatus()
  }
  else if (key === 'edit') {
    isEditOpen.value = true
  }
  else if (key === 'delete') {
    showComponent.value = CategoryDeleteContent
    isDeleteOpen.value = true
  }
}
</script>

<template>
  <DataTableRowActions :items="items" @action="handleAction" />

  <CategoryEdit v-model:open="isEditOpen" :category="category" @close="isEditOpen = false" />

  <Modal v-model:open="isDeleteOpen">
    <ModalContent>
      <component
        :is="showComponent"
        :category="category"
        @close="isDeleteOpen = false"
      />
    </ModalContent>
  </Modal>
</template>
