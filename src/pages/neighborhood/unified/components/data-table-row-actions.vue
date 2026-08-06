<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { INeighborhoodUnified } from '@/services/api/neighborhood-unified.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'

import UnifiedDeleteDialog from './unified-delete-dialog.vue'
import UnifiedDetailDialog from './unified-detail-dialog.vue'
import UnifiedFormSheet from './unified-form-sheet.vue'

const props = defineProps<{ row: Row<INeighborhoodUnified> }>()
const unified = computed(() => props.row.original)
const isDetailOpen = ref(false)
const isEditOpen = ref(false)
const isDeleteOpen = ref(false)
const { items, handleAction } = useRowActions({
  view: () => { isDetailOpen.value = true },
  edit: () => { isEditOpen.value = true },
  delete: () => { isDeleteOpen.value = true },
})
</script>

<template>
  <DataTableRowActions :items="items" @action="handleAction" />

  <UnifiedDetailDialog v-model:open="isDetailOpen" :unique-code="unified?.uniqueCode" />
  <UnifiedFormSheet v-model:open="isEditOpen" :unified="unified" />
  <UnifiedDeleteDialog v-model:open="isDeleteOpen" :unified="unified" />
</template>
