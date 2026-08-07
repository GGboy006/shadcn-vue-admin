<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { ICommunityCate } from '@/services/api/community-cate.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'

import CateDeleteDialog from './cate-delete-dialog.vue'
import CateDetailDialog from './cate-detail-dialog.vue'
import CateFormSheet from './cate-form-sheet.vue'

const props = defineProps<{ row: Row<ICommunityCate> }>()
const cate = computed(() => props.row.original)
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

  <CateDetailDialog v-model:open="isDetailOpen" :cate="cate" />
  <CateFormSheet v-model:open="isEditOpen" :cate="cate" />
  <CateDeleteDialog v-model:open="isDeleteOpen" :cate="cate" />
</template>
