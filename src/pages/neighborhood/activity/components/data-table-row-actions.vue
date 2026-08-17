<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { INeighborhoodActivity } from '@/services/api/neighborhood-activity.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'
import { useLazyMount } from '@/composables/use-lazy-mount'

import ActivityDeleteDialog from './activity-delete-dialog.vue'
import ActivityDetailDialog from './activity-detail-dialog.vue'
import ActivityFormSheet from './activity-form-sheet.vue'

const props = defineProps<{ row: Row<INeighborhoodActivity> }>()
const activity = computed(() => props.row.original)
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

  <ActivityDetailDialog v-if="isDetailOpenRendered" v-model:open="isDetailOpen" :unique-code="activity?.uniqueCode" />
  <ActivityFormSheet v-if="isEditOpenRendered" v-model:open="isEditOpen" :activity="activity" />
  <ActivityDeleteDialog v-if="isDeleteOpenRendered" v-model:open="isDeleteOpen" :activity="activity" />
</template>
