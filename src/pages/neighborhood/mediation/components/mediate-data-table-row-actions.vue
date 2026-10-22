<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { EyeIcon, PencilIcon, Trash2Icon, UserRoundCheckIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

import type { RowActionItem } from '@/components/data-table'
import type { MediateCase } from '@/services/api/neighborhood-resident.api'

import { DataTableRowActions } from '@/components/data-table'
import { useLazyMount } from '@/composables/use-lazy-mount'
import { useDeleteMediateMutation } from '@/services/api/neighborhood-resident.api'

import GovDeleteDialog from '../../components/gov-delete-dialog.vue'
import GovFormSheet from '../../components/gov-form-sheet.vue'
import MediateAcceptForm from './mediate-accept-form.vue'
import MediateForm from './mediate-form.vue'

const props = defineProps<{ row: Row<MediateCase> }>()
const record = computed(() => props.row.original)
const isDetailOpen = ref(false)
const isDetailRendered = useLazyMount(isDetailOpen)
const isAcceptOpen = ref(false)
const isAcceptRendered = useLazyMount(isAcceptOpen)
const isEditOpen = ref(false)
const isEditRendered = useLazyMount(isEditOpen)
const isDeleteOpen = ref(false)
const isDeleteRendered = useLazyMount(isDeleteOpen)
const { mutate: removeRow, isPending } = useDeleteMediateMutation()

const items = computed(() => {
  const next: RowActionItem[] = [
    { key: 'detail', label: '详情', icon: EyeIcon },
  ]
  if (record.value.status === 1 || record.value.status === 2)
    next.push({ key: 'accept', label: '受理', icon: UserRoundCheckIcon })
  next.push(
    { key: 'edit', label: '编辑', icon: PencilIcon },
    { key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' },
  )
  return next
})

function handleAction(key: string) {
  if (key === 'detail')
    isDetailOpen.value = true
  else if (key === 'accept')
    isAcceptOpen.value = true
  else if (key === 'edit')
    isEditOpen.value = true
  else if (key === 'delete')
    isDeleteOpen.value = true
}

function confirmDelete() {
  removeRow(record.value.mediateId, {
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

  <GovFormSheet v-if="isDetailRendered" v-model:open="isDetailOpen" title="申请详情">
    <dl v-if="isDetailOpen" class="grid gap-3 text-sm sm:grid-cols-2">
      <div>
        <dt class="text-muted-foreground">
          申请人
        </dt>
        <dd>{{ record.userName || '-' }}</dd>
      </div>
      <div>
        <dt class="text-muted-foreground">
          电话
        </dt>
        <dd>{{ record.userPhone || '-' }}</dd>
      </div>
      <div>
        <dt class="text-muted-foreground">
          类型
        </dt>
        <dd>{{ record.typeLabel || '-' }}</dd>
      </div>
      <div>
        <dt class="text-muted-foreground">
          状态
        </dt>
        <dd>{{ record.statusLabel || '-' }}</dd>
      </div>
      <div class="sm:col-span-2">
        <dt class="text-muted-foreground">
          事情经过
        </dt>
        <dd class="whitespace-pre-wrap">
          {{ record.content || '-' }}
        </dd>
      </div>
    </dl>
  </GovFormSheet>

  <GovFormSheet v-if="isAcceptRendered" v-model:open="isAcceptOpen" title="受理申请">
    <MediateAcceptForm v-if="isAcceptOpen" :mediate-id="record.mediateId" @close="isAcceptOpen = false" />
  </GovFormSheet>

  <GovFormSheet v-if="isEditRendered" v-model:open="isEditOpen" title="编辑调解申请">
    <MediateForm v-if="isEditOpen" :key="record.mediateId" :row="record" @close="isEditOpen = false" />
  </GovFormSheet>

  <GovDeleteDialog
    v-if="isDeleteRendered"
    v-model:open="isDeleteOpen"
    :title="`删除 ${record.userName || '这条申请'}`"
    :pending="isPending"
    @confirm="confirmDelete"
  />
</template>
