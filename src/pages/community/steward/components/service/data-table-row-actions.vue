<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import { BanIcon, CircleCheckIcon, PencilIcon, Trash2Icon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { IHousekeeperService } from '@/services/api/housekeeper.api'

import { DataTableRowActions } from '@/components/data-table'
import { Modal, ModalContent } from '@/components/prop-ui/modal'
import { useUpdateHousekeeperServiceStatusMutation } from '@/services/api/housekeeper.api'

import ServiceDeleteContent from './service-delete.vue'
import ServiceEdit from './service-edit.vue'

interface DataTableRowActionsProps {
  row: Row<IHousekeeperService>
}
const props = defineProps<DataTableRowActionsProps>()
const service = computed(() => props.row.original)

const isEditOpen = ref(false)
const isDeleteOpen = ref(false)
const showComponent = shallowRef<Component | null>(null)

const { mutate: toggleStatus, isPending: isToggling } = useUpdateHousekeeperServiceStatusMutation()

const items = computed(() => [
  { key: 'toggleStatus', label: service.value.status === 1 ? '禁用' : '启用', icon: service.value.status === 1 ? BanIcon : CircleCheckIcon, disabled: isToggling.value },
  { key: 'edit', label: '编辑', icon: PencilIcon },
  { key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' as const },
])

function handleToggleStatus() {
  const next = service.value.status === 1 ? 2 : 1
  toggleStatus({ housekeeperId: service.value.housekeeperId, status: next }, {
    onSuccess: () => toast.success(next === 1 ? '已启用' : '已禁用'),
    onError: (err: any) => toast.error(err.message || '操作失败'),
  })
}

function handleAction(key: string) {
  if (key === 'toggleStatus') {
    handleToggleStatus()
  }
  else if (key === 'edit') {
    isEditOpen.value = true
  }
  else if (key === 'delete') {
    showComponent.value = ServiceDeleteContent
    isDeleteOpen.value = true
  }
}
</script>

<template>
  <DataTableRowActions :items="items" @action="handleAction" />

  <ServiceEdit v-model:open="isEditOpen" :service="service" @close="isEditOpen = false" />

  <Modal v-model:open="isDeleteOpen">
    <ModalContent>
      <component
        :is="showComponent"
        :service="service"
        @close="isDeleteOpen = false"
      />
    </ModalContent>
  </Modal>
</template>
