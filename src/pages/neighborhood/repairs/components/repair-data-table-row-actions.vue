<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { EyeIcon, PencilIcon, PlusIcon, Trash2Icon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { RepairOrder } from '@/services/api/neighborhood-resident.api'

import { DataTableRowActions } from '@/components/data-table'
import { useLazyMount } from '@/composables/use-lazy-mount'
import { useDeleteRepairMutation } from '@/services/api/neighborhood-resident.api'

import GovDeleteDialog from '../../components/gov-delete-dialog.vue'
import GovFormSheet from '../../components/gov-form-sheet.vue'
import RepairDetail from './repair-detail.vue'
import RepairForm from './repair-form.vue'
import RepairProgress from './repair-progress.vue'

const props = defineProps<{ row: Row<RepairOrder> }>()
const record = computed(() => props.row.original)
const isDetailOpen = ref(false)
const isDetailRendered = useLazyMount(isDetailOpen)
const isProgressOpen = ref(false)
const isProgressRendered = useLazyMount(isProgressOpen)
const isEditOpen = ref(false)
const isEditRendered = useLazyMount(isEditOpen)
const isDeleteOpen = ref(false)
const isDeleteRendered = useLazyMount(isDeleteOpen)
const { mutate: removeRow, isPending } = useDeleteRepairMutation()
const items = computed(() => [
  { key: 'detail', label: '详情', icon: EyeIcon },
  { key: 'progress', label: '进度', icon: PlusIcon },
  { key: 'edit', label: '编辑', icon: PencilIcon },
  { key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' as const },
])

function handleAction(key: string) {
  if (key === 'detail')
    isDetailOpen.value = true
  else if (key === 'progress')
    isProgressOpen.value = true
  else if (key === 'edit')
    isEditOpen.value = true
  else if (key === 'delete')
    isDeleteOpen.value = true
}

function confirmDelete() {
  removeRow(record.value.repairId, {
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

  <GovFormSheet v-if="isDetailRendered" v-model:open="isDetailOpen" title="报修详情">
    <RepairDetail v-if="isDetailOpen" :repair-id="record.repairId" />
  </GovFormSheet>

  <GovFormSheet v-if="isProgressRendered" v-model:open="isProgressOpen" title="记录进度">
    <RepairProgress v-if="isProgressOpen" :repair-id="record.repairId" @close="isProgressOpen = false" />
  </GovFormSheet>

  <GovFormSheet v-if="isEditRendered" v-model:open="isEditOpen" title="编辑报修">
    <RepairForm v-if="isEditOpen" :key="record.repairId" :row="record" @close="isEditOpen = false" />
  </GovFormSheet>

  <GovDeleteDialog
    v-if="isDeleteRendered"
    v-model:open="isDeleteOpen"
    :title="`删除 ${record.name || record.code || '这条报修'}`"
    :pending="isPending"
    @confirm="confirmDelete"
  />
</template>
