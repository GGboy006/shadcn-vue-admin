<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { INeighborhoodDynamic } from '@/services/api/neighborhood-dynamic.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'

import DynamicDeleteDialog from './dynamic-delete-dialog.vue'
import DynamicDetailDialog from './dynamic-detail-dialog.vue'
import DynamicFormSheet from './dynamic-form-sheet.vue'

const props = defineProps<{ row: Row<INeighborhoodDynamic> }>()
const dynamic = computed(() => props.row.original)
const { isDetailOpen, isEditOpen, isDeleteOpen, openDetail, openEdit, openDelete } = useRowActions()
</script>

<template>
  <DataTableRowActions @view="openDetail" @edit="openEdit" @delete="openDelete" />

  <DynamicDetailDialog v-model:open="isDetailOpen" :unique-code="dynamic?.uniqueCode" />
  <DynamicFormSheet v-model:open="isEditOpen" :dynamic="dynamic" />
  <DynamicDeleteDialog v-model:open="isDeleteOpen" :dynamic="dynamic" />
</template>
