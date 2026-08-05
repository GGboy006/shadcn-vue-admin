<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { EllipsisIcon, EyeIcon, PencilIcon } from '@lucide/vue'

import type { INeighborhoodSpecialArticle } from '@/services/api/neighborhood-special-article.api'

import SpecialArticleDeleteDialog from './special-article-delete-dialog.vue'
import SpecialArticleDetailDialog from './special-article-detail-dialog.vue'
import SpecialArticleFormSheet from './special-article-form-sheet.vue'

interface DataTableRowActionsProps {
  row: Row<INeighborhoodSpecialArticle>
  /** 新建/编辑时需要 specialCode,从路由取 */
  specialCode: string
}
const props = defineProps<DataTableRowActionsProps>()
const article = computed(() => props.row.original)

const isDetailOpen = ref(false)
const isEditOpen = ref(false)
const isDeleteOpen = ref(false)

const detailUniqueCode = computed(() => article.value?.uniqueCode)

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

  <SpecialArticleDetailDialog
    v-model:open="isDetailOpen"
    :unique-code="detailUniqueCode"
  />

  <SpecialArticleFormSheet
    v-model:open="isEditOpen"
    :article="article"
    :special-code="specialCode"
  />

  <SpecialArticleDeleteDialog
    v-model:open="isDeleteOpen"
    :article="article"
  />
</template>
