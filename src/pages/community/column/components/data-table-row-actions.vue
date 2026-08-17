<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { ICommunityColumn } from '@/services/api/community-column.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'
import { useLazyMount } from '@/composables/use-lazy-mount'

import ColumnDeleteDialog from './column-delete-dialog.vue'
import ColumnDetailDialog from './column-detail-dialog.vue'
import ColumnFormSheet from './column-form-sheet.vue'

const props = defineProps<{ row: Row<ICommunityColumn> }>()
const column = computed(() => props.row.original)
const isDetailOpen = ref(false)
const isDetailOpenRendered = useLazyMount(isDetailOpen)
const isEditOpen = ref(false)
const isEditOpenRendered = useLazyMount(isEditOpen)
const isDeleteOpen = ref(false)
const isDeleteOpenRendered = useLazyMount(isDeleteOpen)
const { items, handleAction } = useRowActions({
  view: () => { isDetailOpen.value = true },
  edit: () => { isEditOpen.value = true },
  delete: () => { isDeleteOpen.value = true },
})
</script>

<template>
  <DataTableRowActions :items="items" @action="handleAction" />

  <ColumnDetailDialog v-if="isDetailOpenRendered" v-model:open="isDetailOpen" :column="column" />
  <ColumnFormSheet v-if="isEditOpenRendered" v-model:open="isEditOpen" :column="column" />
  <ColumnDeleteDialog v-if="isDeleteOpenRendered" v-model:open="isDeleteOpen" :column="column" />
</template>
