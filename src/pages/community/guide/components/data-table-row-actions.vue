<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { ICommunityServiceGuide } from '@/services/api/community-service-guide.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'
import { useLazyMount } from '@/composables/use-lazy-mount'

import GuideDeleteDialog from './guide-delete-dialog.vue'
import GuideDetailDialog from './guide-detail-dialog.vue'
import GuideFormSheet from './guide-form-sheet.vue'

const props = defineProps<{ row: Row<ICommunityServiceGuide> }>()
const guide = computed(() => props.row.original)
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

  <GuideDetailDialog v-if="isDetailOpenRendered" v-model:open="isDetailOpen" :guide="guide" />
  <GuideFormSheet v-if="isEditOpenRendered" v-model:open="isEditOpen" :guide="guide" />
  <GuideDeleteDialog v-if="isDeleteOpenRendered" v-model:open="isDeleteOpen" :guide="guide" />
</template>
