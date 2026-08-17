<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { INeighborhoodDynamic } from '@/services/api/neighborhood-dynamic.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'
import { useLazyMount } from '@/composables/use-lazy-mount'

import DynamicDeleteDialog from './dynamic-delete-dialog.vue'
import DynamicDetailDialog from './dynamic-detail-dialog.vue'
import DynamicFormSheet from './dynamic-form-sheet.vue'

const props = defineProps<{ row: Row<INeighborhoodDynamic> }>()
const dynamic = computed(() => props.row.original)
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

  <DynamicDetailDialog v-if="isDetailOpenRendered" v-model:open="isDetailOpen" :unique-code="dynamic?.uniqueCode" />
  <DynamicFormSheet v-if="isEditOpenRendered" v-model:open="isEditOpen" :dynamic="dynamic" />
  <DynamicDeleteDialog v-if="isDeleteOpenRendered" v-model:open="isDeleteOpen" :dynamic="dynamic" />
</template>
