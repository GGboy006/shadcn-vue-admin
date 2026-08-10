<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { ICommunityServiceGuide } from '@/services/api/community-service-guide.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'

import GuideDeleteDialog from './guide-delete-dialog.vue'
import GuideDetailDialog from './guide-detail-dialog.vue'
import GuideFormSheet from './guide-form-sheet.vue'

const props = defineProps<{ row: Row<ICommunityServiceGuide> }>()
const guide = computed(() => props.row.original)
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

  <GuideDetailDialog v-model:open="isDetailOpen" :guide="guide" />
  <GuideFormSheet v-model:open="isEditOpen" :guide="guide" />
  <GuideDeleteDialog v-model:open="isDeleteOpen" :guide="guide" />
</template>
