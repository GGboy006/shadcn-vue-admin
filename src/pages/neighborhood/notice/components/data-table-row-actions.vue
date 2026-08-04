<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { EllipsisIcon, EyeIcon, PencilIcon } from '@lucide/vue'

import type { INeighborhoodNotice } from '@/services/api/neighborhood-notice.api'

import NoticeDeleteDialog from './notice-delete-dialog.vue'
import NoticeDetailDialog from './notice-detail-dialog.vue'
import NoticeFormSheet from './notice-form-sheet.vue'

interface DataTableRowActionsProps {
  row: Row<INeighborhoodNotice>
}
const props = defineProps<DataTableRowActionsProps>()
const notice = computed(() => props.row.original)

const isDetailOpen = ref(false)
const isEditOpen = ref(false)
const isDeleteOpen = ref(false)

const detailUniqueCode = computed(() => notice.value?.uniqueCode)

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
        <EyeIcon class="size-4 mr-2" />
        查看
      </UiDropdownMenuItem>

      <UiDropdownMenuItem @click.stop="handleEdit">
        <PencilIcon class="size-4 mr-2" />
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

  <!-- 查看:Dialog(居中弹窗,只读详情) -->
  <NoticeDetailDialog
    v-model:open="isDetailOpen"
    :unique-code="detailUniqueCode"
  />

  <!-- 新增/编辑:Sheet(右侧滑出抽屉,表单) -->
  <NoticeFormSheet
    v-model:open="isEditOpen"
    :notice="notice"
  />

  <!-- 删除:AlertDialog(确认弹窗) -->
  <NoticeDeleteDialog
    v-model:open="isDeleteOpen"
    :notice="notice"
  />
</template>
