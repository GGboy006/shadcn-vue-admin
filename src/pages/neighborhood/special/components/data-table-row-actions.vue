<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { INeighborhoodSpecial } from '@/services/api/neighborhood-special.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'

import SpecialDeleteDialog from './special-delete-dialog.vue'
import SpecialFormSheet from './special-form-sheet.vue'

const props = defineProps<{ row: Row<INeighborhoodSpecial> }>()
const special = computed(() => props.row.original)
const isEditOpen = ref(false)
const isDeleteOpen = ref(false)
const { items, handleAction } = useRowActions({
  edit: () => { isEditOpen.value = true },
  delete: () => { isDeleteOpen.value = true },
})
</script>

<template>
  <DataTableRowActions :items="items" @action="handleAction" />

  <SpecialFormSheet v-model:open="isEditOpen" :special="special" />
  <SpecialDeleteDialog v-model:open="isDeleteOpen" :special="special" />
</template>
