<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { INeighborhoodDynamic } from '@/services/api/neighborhood-dynamic.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'

import DynamicDeleteDialog from './dynamic-delete-dialog.vue'
import DynamicDetailDialog from './dynamic-detail-dialog.vue'
import DynamicFormSheet from './dynamic-form-sheet.vue'

const props = defineProps<{ row: Row<INeighborhoodDynamic> }>()
const dynamic = computed(() => props.row.original)
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

  <DynamicDetailDialog v-model:open="isDetailOpen" :unique-code="dynamic?.uniqueCode" />
  <DynamicFormSheet v-model:open="isEditOpen" :dynamic="dynamic" />
  <DynamicDeleteDialog v-model:open="isDeleteOpen" :dynamic="dynamic" />
</template>
