<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { EllipsisIcon, EyeIcon, PencilIcon } from '@lucide/vue'

import type { INeighborhoodService } from '@/services/api/neighborhood-service.api'

import ServiceDeleteDialog from './service-delete-dialog.vue'
import ServiceDetailDialog from './service-detail-dialog.vue'
import ServiceFormSheet from './service-form-sheet.vue'

interface DataTableRowActionsProps {
  row: Row<INeighborhoodService>
}
const props = defineProps<DataTableRowActionsProps>()
const service = computed(() => props.row.original)

const isDetailOpen = ref(false)
const isEditOpen = ref(false)
const isDeleteOpen = ref(false)

const detailUniqueCode = computed(() => service.value?.uniqueCode)

function handleView() {
  isDetailOpen.value = true
}

function handleEdit() {
  isEditOpen.value = true
}

function handleDelete() {
  isDeleteOpen.value = true
}
</script>

<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <UiButton
        variant="ghost"
        class="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
      >
        <EllipsisIcon class="size-4" />
        <span class="sr-only">Open menu</span>
      </UiButton>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end" class="w-[160px]">
      <UiDropdownMenuItem @click.stop="handleView">
        <EyeIcon class="mr-2 size-4" />
        查看
      </UiDropdownMenuItem>

      <UiDropdownMenuItem @click.stop="handleEdit">
        <PencilIcon class="mr-2 size-4" />
        编辑
      </UiDropdownMenuItem>

      <UiDropdownMenuSeparator />

      <UiDropdownMenuItem
        class="text-destructive focus:text-destructive"
        @click.stop="handleDelete"
      >
        删除
        <UiDropdownMenuShortcut>⌘⌫</UiDropdownMenuShortcut>
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>

  <ServiceDetailDialog
    v-model:open="isDetailOpen"
    :unique-code="detailUniqueCode"
  />

  <ServiceFormSheet
    v-model:open="isEditOpen"
    :service="service"
  />

  <ServiceDeleteDialog
    v-model:open="isDeleteOpen"
    :service="service"
  />
</template>
