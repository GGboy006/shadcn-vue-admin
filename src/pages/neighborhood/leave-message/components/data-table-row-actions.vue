<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { EyeIcon } from '@lucide/vue'

import type { INeighborhoodLeaveMessage } from '@/services/api/neighborhood-leave-message.api'

import { DataTableRowActions } from '@/components/data-table'

import LeaveMessageDetailDialog from './leave-message-detail-dialog.vue'

const props = defineProps<{ row: Row<INeighborhoodLeaveMessage> }>()
const message = computed(() => props.row.original)
const isDetailOpen = ref(false)

const items = [
  { key: 'view', label: '查看详情', icon: EyeIcon },
]
function handleAction(key: string) {
  if (key === 'view')
    isDetailOpen.value = true
}
</script>

<template>
  <DataTableRowActions
    mode="buttons"
    :items="items"
    @action="handleAction"
  />

  <LeaveMessageDetailDialog v-model:open="isDetailOpen" :message="message" />
</template>
