<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { PencilIcon, Trash2Icon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { PartyPublicity } from '@/services/api/neighborhood-governance.api'

import { DataTableRowActions } from '@/components/data-table'
import { useLazyMount } from '@/composables/use-lazy-mount'
import { useDeletePublicityMutation } from '@/services/api/neighborhood-governance.api'

import GovDeleteDialog from '../../components/gov-delete-dialog.vue'
import GovFormSheet from '../../components/gov-form-sheet.vue'
import PublicityForm from './publicity-form.vue'

const props = defineProps<{ row: Row<PartyPublicity> }>()
const record = computed(() => props.row.original)

const isEditOpen = ref(false)
const isEditRendered = useLazyMount(isEditOpen)
const isDeleteOpen = ref(false)
const isDeleteRendered = useLazyMount(isDeleteOpen)
const { mutate: removeRow, isPending } = useDeletePublicityMutation()
const items = computed(() => [
  { key: 'edit', label: '编辑', icon: PencilIcon },
  { key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' as const },
])

function handleAction(key: string) {
  if (key === 'edit')
    isEditOpen.value = true
  else if (key === 'delete')
    isDeleteOpen.value = true
}

function confirmDelete() {
  removeRow(record.value.publicityId, {
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

  <GovFormSheet v-if="isEditRendered" v-model:open="isEditOpen" title="编辑公示">
    <PublicityForm v-if="isEditOpen" :key="record.publicityId" :row="record" @close="isEditOpen = false" />
  </GovFormSheet>

  <GovDeleteDialog
    v-if="isDeleteRendered"
    v-model:open="isDeleteOpen"
    :title="`删除公示：${record.name}`"
    :pending="isPending"
    @confirm="confirmDelete"
  />
</template>
