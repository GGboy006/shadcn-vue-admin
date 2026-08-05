<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { EllipsisIcon, PencilIcon } from '@lucide/vue'

import type { INeighborhoodSpecial } from '@/services/api/neighborhood-special.api'

import SpecialDeleteDialog from './special-delete-dialog.vue'
import SpecialFormSheet from './special-form-sheet.vue'

interface DataTableRowActionsProps {
  row: Row<INeighborhoodSpecial>
}
const props = defineProps<DataTableRowActionsProps>()
const special = computed(() => props.row.original)

const isEditOpen = ref(false)
const isDeleteOpen = ref(false)

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

  <SpecialFormSheet
    v-model:open="isEditOpen"
    :special="special"
  />

  <SpecialDeleteDialog
    v-model:open="isDeleteOpen"
    :special="special"
  />
</template>
