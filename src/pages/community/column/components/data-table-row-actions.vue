<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { ICommunityColumn } from '@/services/api/community-column.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'

import ColumnDeleteDialog from './column-delete-dialog.vue'
import ColumnDetailDialog from './column-detail-dialog.vue'
import ColumnFormSheet from './column-form-sheet.vue'

const props = defineProps<{ row: Row<ICommunityColumn> }>()
const column = computed(() => props.row.original)
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

  <ColumnDetailDialog v-model:open="isDetailOpen" :column="column" />
  <ColumnFormSheet v-model:open="isEditOpen" :column="column" />
  <ColumnDeleteDialog v-model:open="isDeleteOpen" :column="column" />
</template>
