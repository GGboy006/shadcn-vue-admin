<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { EyeIcon, PencilIcon, Trash2Icon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { Volunteer } from '@/services/api/neighborhood-resident.api'

import { DataTableRowActions } from '@/components/data-table'
import { useLazyMount } from '@/composables/use-lazy-mount'
import { useDeleteVolunteerMutation } from '@/services/api/neighborhood-resident.api'

import GovDeleteDialog from '../../components/gov-delete-dialog.vue'
import GovFormSheet from '../../components/gov-form-sheet.vue'
import VolunteerDetail from './volunteer-detail.vue'
import VolunteerForm from './volunteer-form.vue'

const props = defineProps<{ row: Row<Volunteer> }>()
const record = computed(() => props.row.original)
const isDetailOpen = ref(false)
const isDetailRendered = useLazyMount(isDetailOpen)
const isEditOpen = ref(false)
const isEditRendered = useLazyMount(isEditOpen)
const isDeleteOpen = ref(false)
const isDeleteRendered = useLazyMount(isDeleteOpen)
const { mutate: removeRow, isPending } = useDeleteVolunteerMutation()
const items = computed(() => [
  { key: 'detail', label: '详情', icon: EyeIcon },
  { key: 'edit', label: '编辑', icon: PencilIcon },
  { key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' as const },
])

function handleAction(key: string) {
  if (key === 'detail')
    isDetailOpen.value = true
  else if (key === 'edit')
    isEditOpen.value = true
  else if (key === 'delete')
    isDeleteOpen.value = true
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

  <GovFormSheet v-if="isDetailRendered" v-model:open="isDetailOpen" :title="`${record.userName} 的时长`">
    <VolunteerDetail v-if="isDetailOpen" :volunteer-id="record.volunteerId" />
  </GovFormSheet>

  <GovFormSheet v-if="isEditRendered" v-model:open="isEditOpen" title="编辑志愿者">
    <VolunteerForm v-if="isEditOpen" :key="record.volunteerId" :row="record" @close="isEditOpen = false" />
  </GovFormSheet>

  <GovDeleteDialog
    v-if="isDeleteRendered"
    v-model:open="isDeleteOpen"
    :title="`删除 ${record.userName || '这位志愿者'}`"
    description="同时会删掉这个人的时长记录。"
    :pending="isPending"
    @confirm="confirmDelete"
  />
</template>
