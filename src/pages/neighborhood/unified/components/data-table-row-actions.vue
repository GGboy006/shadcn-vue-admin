<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { INeighborhoodUnified } from '@/services/api/neighborhood-unified.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'

import UnifiedDeleteDialog from './unified-delete-dialog.vue'
import UnifiedDetailDialog from './unified-detail-dialog.vue'
import UnifiedFormSheet from './unified-form-sheet.vue'

const props = defineProps<{ row: Row<INeighborhoodUnified> }>()
const unified = computed(() => props.row.original)
const { isDetailOpen, isEditOpen, isDeleteOpen, openDetail, openEdit, openDelete } = useRowActions()
</script>

<template>
  <DataTableRowActions @view="openDetail" @edit="openEdit" @delete="openDelete" />

  <UnifiedDetailDialog v-model:open="isDetailOpen" :unique-code="unified?.uniqueCode" />
  <UnifiedFormSheet v-model:open="isEditOpen" :unified="unified" />
  <UnifiedDeleteDialog v-model:open="isDeleteOpen" :unified="unified" />
</template>
