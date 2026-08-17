<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import { BanIcon, CircleCheckIcon, PencilIcon, Trash2Icon, UserPlusIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { IHousekeeperCategory } from '@/services/api/housekeeper.api'

import { DataTableRowActions } from '@/components/data-table'
import { Modal, ModalContent } from '@/components/prop-ui/modal'
import { useLazyMount } from '@/composables/use-lazy-mount'
import { useUpdateHousekeeperCategoryStatusMutation } from '@/services/api/housekeeper.api'

import CategoryDeleteContent from './category-delete.vue'
import CategoryEdit from './category-edit.vue'

interface DataTableRowActionsProps {
  row: Row<IHousekeeperCategory>
}
const props = defineProps<DataTableRowActionsProps>()
const category = computed(() => props.row.original)

const router = useRouter()

const isEditOpen = ref(false)

const isEditOpenRendered = useLazyMount(isEditOpen)
const isDeleteOpen = ref(false)
const isDeleteOpenRendered = useLazyMount(isDeleteOpen)
const showComponent = shallowRef<Component | null>(null)

const { mutate: toggleStatus, isPending: isToggling } = useUpdateHousekeeperCategoryStatusMutation()

const items = computed(() => [
  { key: 'assign', label: '分配人员', icon: UserPlusIcon },
  { key: 'toggleStatus', label: category.value.status === 1 ? '禁用' : '启用', icon: category.value.status === 1 ? BanIcon : CircleCheckIcon, disabled: isToggling.value },
  { key: 'edit', label: '编辑', icon: PencilIcon },
  { key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' as const },
])

function handleToggleStatus() {
  const next = category.value.status === 1 ? 2 : 1
  toggleStatus({ categoryId: category.value.categoryId, status: next }, {
    onSuccess: () => toast.success(next === 1 ? '已启用' : '已禁用'),
    onError: (err: any) => toast.error(err.message || '操作失败'),
  })
}

function handleAssign() {
  router.push(`/community/steward/${category.value.categoryId}`)
}

function handleAction(key: string) {
  if (key === 'assign') {
    handleAssign()
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

  <CategoryEdit v-if="isEditOpenRendered" v-model:open="isEditOpen" :category="category" @close="isEditOpen = false" />

  <Modal v-if="isDeleteOpenRendered" v-model:open="isDeleteOpen">
    <ModalContent>
      <component
        :is="showComponent"
        :category="category"
        @close="isDeleteOpen = false"
      />
    </ModalContent>
  </Modal>
</template>
