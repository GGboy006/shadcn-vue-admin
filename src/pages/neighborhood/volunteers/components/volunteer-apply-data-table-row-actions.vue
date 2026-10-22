<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { BanIcon, CircleCheckIcon, Trash2Icon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { RowActionItem } from '@/components/data-table'
import type { Volunteer } from '@/services/api/neighborhood-resident.api'

import { DataTableRowActions } from '@/components/data-table'
import { useLazyMount } from '@/composables/use-lazy-mount'
import { useAuditVolunteerMutation, useDeleteVolunteerMutation } from '@/services/api/neighborhood-resident.api'

import GovConfirmDialog from '../../components/gov-confirm-dialog.vue'
import GovDeleteDialog from '../../components/gov-delete-dialog.vue'

const props = defineProps<{ row: Row<Volunteer> }>()
const record = computed(() => props.row.original)
const auditStatus = ref<2 | 3>(2)
const isAuditOpen = ref(false)
const isAuditRendered = useLazyMount(isAuditOpen)
const isDeleteOpen = ref(false)
const isDeleteRendered = useLazyMount(isDeleteOpen)
const { mutate: audit, isPending: isAuditing } = useAuditVolunteerMutation()
const { mutate: removeRow, isPending: isDeleting } = useDeleteVolunteerMutation()

const items = computed(() => {
  const next: RowActionItem[] = []
  if (record.value.status === 1) {
    next.push(
      { key: 'pass', label: '通过', icon: CircleCheckIcon },
      { key: 'reject', label: '拒绝', icon: BanIcon },
    )
  }
  next.push({ key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' })
  return next
})

function handleAction(key: string) {
  if (key === 'pass') {
    auditStatus.value = 2
    isAuditOpen.value = true
  }
  else if (key === 'reject') {
    auditStatus.value = 3
    isAuditOpen.value = true
  }
  else if (key === 'delete') {
    isDeleteOpen.value = true
  }
}

function confirmAudit() {
  audit({ volunteerId: record.value.volunteerId, status: auditStatus.value }, {
    onSuccess: () => {
      toast.success(auditStatus.value === 2 ? '已通过' : '已拒绝')
      isAuditOpen.value = false
    },
    onError: (err: Error) => toast.error(err.message || '审核失败'),
  })
}

function confirmDelete() {
  removeRow(record.value.volunteerId, {
    onSuccess: () => {
      toast.success('已删除')
      isDeleteOpen.value = false
    },
    onError: (err: Error) => toast.error(err.message || '删除失败'),
  })
}
</script>

<template>
  <DataTableRowActions :items="items" @action="handleAction" />

  <GovConfirmDialog
    v-if="isAuditRendered"
    v-model:open="isAuditOpen"
    :title="auditStatus === 2 ? `通过 ${record.userName}` : `拒绝 ${record.userName}`"
    :description="auditStatus === 2 ? '通过后会出现在志愿者列表。' : '拒绝后仍留在报名列表。'"
    :confirm-text="auditStatus === 2 ? '通过' : '拒绝'"
    :destructive="auditStatus === 3"
    :pending="isAuditing"
    @confirm="confirmAudit"
  />

  <GovDeleteDialog
    v-if="isDeleteRendered"
    v-model:open="isDeleteOpen"
    :title="`删除 ${record.userName || '这条报名'}`"
    :pending="isDeleting"
    @confirm="confirmDelete"
  />
</template>
