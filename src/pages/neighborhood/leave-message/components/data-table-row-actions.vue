<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { INeighborhoodLeaveMessage } from '@/services/api/neighborhood-leave-message.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'

import LeaveMessageDetailDialog from './leave-message-detail-dialog.vue'

const props = defineProps<{ row: Row<INeighborhoodLeaveMessage> }>()
const message = computed(() => props.row.original)
const { isDetailOpen, openDetail } = useRowActions()
</script>

<template>
  <DataTableRowActions
    mode="buttons"
    :show-edit="false"
    :show-delete="false"
    view-text="查看详情"
    @view="openDetail"
  />

  <LeaveMessageDetailDialog v-model:open="isDetailOpen" :message="message" />
</template>
