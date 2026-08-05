<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { EyeIcon } from '@lucide/vue'

import type { INeighborhoodLeaveMessage } from '@/services/api/neighborhood-leave-message.api'

import { Button } from '@/components/ui/button'

import LeaveMessageDetailDialog from './leave-message-detail-dialog.vue'

interface DataTableRowActionsProps {
  row: Row<INeighborhoodLeaveMessage>
}
const props = defineProps<DataTableRowActionsProps>()
const message = computed(() => props.row.original)

const isDetailOpen = ref(false)

function handleView() {
  isDetailOpen.value = true
}
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    class="size-8"
    title="查看详情"
    @click="handleView"
  >
    <EyeIcon class="size-4" />
    <span class="sr-only">查看详情</span>
  </Button>

  <LeaveMessageDetailDialog
    v-model:open="isDetailOpen"
    :message="message"
  />
</template>
