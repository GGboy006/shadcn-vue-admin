<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { INeighborhoodSpecialArticle } from '@/services/api/neighborhood-special-article.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'

import SpecialArticleDeleteDialog from './special-article-delete-dialog.vue'
import SpecialArticleDetailDialog from './special-article-detail-dialog.vue'
import SpecialArticleFormSheet from './special-article-form-sheet.vue'

const props = defineProps<{ row: Row<INeighborhoodSpecialArticle>, specialCode: string }>()
const article = computed(() => props.row.original)
const { isDetailOpen, isEditOpen, isDeleteOpen, openDetail, openEdit, openDelete } = useRowActions()
</script>

<template>
  <DataTableRowActions @view="openDetail" @edit="openEdit" @delete="openDelete" />

  <SpecialArticleDetailDialog v-model:open="isDetailOpen" :unique-code="article?.uniqueCode" />
  <SpecialArticleFormSheet
    v-model:open="isEditOpen"
    :article="article"
    :special-code="specialCode"
  />
  <SpecialArticleDeleteDialog v-model:open="isDeleteOpen" :article="article" />
</template>
