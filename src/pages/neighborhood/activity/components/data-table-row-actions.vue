<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { INeighborhoodActivity } from '@/services/api/neighborhood-activity.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'

import ActivityDeleteDialog from './activity-delete-dialog.vue'
import ActivityDetailDialog from './activity-detail-dialog.vue'
import ActivityFormSheet from './activity-form-sheet.vue'

const props = defineProps<{ row: Row<INeighborhoodActivity> }>()
const activity = computed(() => props.row.original)
const { isDetailOpen, isEditOpen, isDeleteOpen, openDetail, openEdit, openDelete } = useRowActions()
</script>

<template>
  <DataTableRowActions @view="openDetail" @edit="openEdit" @delete="openDelete" />

  <ActivityDetailDialog v-model:open="isDetailOpen" :unique-code="activity?.uniqueCode" />
  <ActivityFormSheet v-model:open="isEditOpen" :activity="activity" />
  <ActivityDeleteDialog v-model:open="isDeleteOpen" :activity="activity" />
</template>
