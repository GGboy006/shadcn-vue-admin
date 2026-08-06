<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { INeighborhoodService } from '@/services/api/neighborhood-service.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'

import ServiceDeleteDialog from './service-delete-dialog.vue'
import ServiceDetailDialog from './service-detail-dialog.vue'
import ServiceFormSheet from './service-form-sheet.vue'

const props = defineProps<{ row: Row<INeighborhoodService> }>()
const service = computed(() => props.row.original)
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

  <ServiceDetailDialog v-model:open="isDetailOpen" :unique-code="service?.uniqueCode" />
  <ServiceFormSheet v-model:open="isEditOpen" :service="service" />
  <ServiceDeleteDialog v-model:open="isDeleteOpen" :service="service" />
</template>
