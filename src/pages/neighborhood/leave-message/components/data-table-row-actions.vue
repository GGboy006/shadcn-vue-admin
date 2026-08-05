<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { EyeIcon } from '@lucide/vue'

import type { INeighborhoodLeaveMessage } from '@/services/api/neighborhood-leave-message.api'

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
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <UiButton
        variant="ghost"
        class="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
      >
        <EyeIcon class="size-4" />
        <span class="sr-only">Open menu</span>
      </UiButton>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end" class="w-[120px]">
      <UiDropdownMenuItem @click.stop="handleView">
        <EyeIcon class="mr-2 size-4" />
        查看详情
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>

  <LeaveMessageDetailDialog
    v-model:open="isDetailOpen"
    :message="message"
  />
</template>
