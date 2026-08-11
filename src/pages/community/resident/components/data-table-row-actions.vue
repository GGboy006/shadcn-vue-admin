<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { IResident } from '@/services/api/resident.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'

import ResidentDetailDialog from './resident-detail-dialog.vue'

const props = defineProps<{ row: Row<IResident> }>()
const resident = computed(() => props.row.original)
const isDetailOpen = ref(false)
const { items, handleAction } = useRowActions({
  view: () => { isDetailOpen.value = true },
})
</script>

<template>
  <DataTableRowActions :items="items" @action="handleAction" />

  <ResidentDetailDialog v-model:open="isDetailOpen" :resident="resident" />
</template>
