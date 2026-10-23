<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { BanIcon, CircleCheckIcon, PencilIcon, Trash2Icon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { RowActionItem } from '@/components/data-table'
import type { VillageStat } from '@/services/api/neighborhood-governance.api'

import { DataTableRowActions } from '@/components/data-table'
import { useLazyMount } from '@/composables/use-lazy-mount'
import { useDeleteStatMutation, useUpdateStatStatusMutation } from '@/services/api/neighborhood-governance.api'

import GovDeleteDialog from '../../components/gov-delete-dialog.vue'
import GovFormSheet from '../../components/gov-form-sheet.vue'
import StatForm from './stat-form.vue'

const props = defineProps<{ row: Row<VillageStat> }>()
const record = computed(() => props.row.original)

const isEditOpen = ref(false)
const isEditRendered = useLazyMount(isEditOpen)
const isDeleteOpen = ref(false)
const isDeleteRendered = useLazyMount(isDeleteOpen)
const { mutate: removeRow, isPending } = useDeleteStatMutation()
const { mutate: updateStatus, isPending: isToggling } = useUpdateStatStatusMutation()

const fixedCodes = new Set([
  'household_count',
  'population',
  'party_member',
  'leadership',
  'garbage_rate',
  'beautiful_yard',
  'illegal_build',
])

const items = computed(() => {
  const next: RowActionItem[] = [
    { key: 'toggle', label: record.value.status === 1 ? '禁用' : '启用', icon: record.value.status === 1 ? BanIcon : CircleCheckIcon, disabled: isToggling.value },
    { key: 'edit', label: '编辑', icon: PencilIcon },
  ]
  if (!fixedCodes.has(record.value.statCode))
    next.push({ key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' as const })
  return next
})

function handleAction(key: string) {
  if (key === 'toggle') {
    const next = record.value.status === 1 ? 2 : 1
    updateStatus({ id: record.value.statId, status: next }, {
      onSuccess: () => toast.success(next === 1 ? '已启用' : '已禁用'),
      onError: (err: Error) => toast.error(err.message || '状态更新失败'),
    })
    return
  }

  if (key === 'edit')
    isEditOpen.value = true
  else if (key === 'delete')
    isDeleteOpen.value = true
}

function confirmDelete() {
  removeRow(record.value.statId, {
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

  <GovFormSheet v-if="isEditRendered" v-model:open="isEditOpen" title="编辑指标">
    <StatForm v-if="isEditOpen" :key="record.statId" :stat="record" @close="isEditOpen = false" />
  </GovFormSheet>

  <GovDeleteDialog
    v-if="isDeleteRendered"
    v-model:open="isDeleteOpen"
    :title="`删除指标：${record.statName}`"
    :pending="isPending"
    @confirm="confirmDelete"
  />
</template>
