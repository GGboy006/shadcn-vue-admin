<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import { BanIcon, CircleCheckIcon, PencilIcon, Trash2Icon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { IPartnerStaff } from '@/services/api/housekeeper-partner.api'

import { DataTableRowActions } from '@/components/data-table'
import { Modal, ModalContent } from '@/components/prop-ui/modal'
import { useLazyMount } from '@/composables/use-lazy-mount'
import { useUpdatePartnerStaffStatusMutation } from '@/services/api/housekeeper-partner.api'

import StaffDeleteContent from './staff-delete.vue'
import StaffSheet from './staff-sheet.vue'

const props = defineProps<{
  row: Row<IPartnerStaff>
}>()
const staff = computed(() => props.row.original)

const isEditOpen = ref(false)
const isEditOpenRendered = useLazyMount(isEditOpen)
const isDeleteOpen = ref(false)
const isDeleteOpenRendered = useLazyMount(isDeleteOpen)
const showComponent = shallowRef<Component | null>(null)

const { mutate: toggleStatus, isPending: isToggling } = useUpdatePartnerStaffStatusMutation()

const items = computed(() => [
  { key: 'toggleStatus', label: staff.value.status === 1 ? '禁用' : '启用', icon: staff.value.status === 1 ? BanIcon : CircleCheckIcon, disabled: isToggling.value },
  { key: 'edit', label: '编辑', icon: PencilIcon },
  { key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' as const },
])

function handleToggleStatus() {
  const next = staff.value.status === 1 ? 2 : 1
  toggleStatus({ staffId: staff.value.staffId, status: next as 1 | 2 }, {
    onSuccess: () => toast.success(next === 1 ? '已启用' : '已禁用'),
    onError: (err: Error) => toast.error(err.message || '操作失败'),
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
    showComponent.value = StaffDeleteContent
    isDeleteOpen.value = true
  }
}
</script>

<template>
  <DataTableRowActions :items="items" @action="handleAction" />

  <StaffSheet v-if="isEditOpenRendered" v-model:open="isEditOpen" :staff="staff" @close="isEditOpen = false" />

  <Modal v-if="isDeleteOpenRendered" v-model:open="isDeleteOpen">
    <ModalContent>
      <component
        :is="showComponent"
        :staff="staff"
        @close="isDeleteOpen = false"
      />
    </ModalContent>
  </Modal>
</template>
