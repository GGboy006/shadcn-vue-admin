<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { INeighborhoodService } from '@/services/api/neighborhood-service.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'

import ServiceDeleteDialog from './service-delete-dialog.vue'
import ServiceDetailDialog from './service-detail-dialog.vue'
import ServiceFormSheet from './service-form-sheet.vue'

const props = defineProps<{ row: Row<INeighborhoodService> }>()
const service = computed(() => props.row.original)
const { isDetailOpen, isEditOpen, isDeleteOpen, openDetail, openEdit, openDelete } = useRowActions()
</script>

<template>
  <DataTableRowActions @view="openDetail" @edit="openEdit" @delete="openDelete" />

  <ServiceDetailDialog v-model:open="isDetailOpen" :unique-code="service?.uniqueCode" />
  <ServiceFormSheet v-model:open="isEditOpen" :service="service" />
  <ServiceDeleteDialog v-model:open="isDeleteOpen" :service="service" />
</template>
