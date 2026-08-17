<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { IResident } from '@/services/api/resident.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'
import { useLazyMount } from '@/composables/use-lazy-mount'

import ResidentDetailDialog from './resident-detail-dialog.vue'

const props = defineProps<{ row: Row<IResident> }>()
const resident = computed(() => props.row.original)
const isDetailOpen = ref(false)
const isDetailOpenRendered = useLazyMount(isDetailOpen)
const { items, handleAction } = useRowActions({
  view: () => { isDetailOpen.value = true },
})
</script>

<template>
  <DataTableRowActions :items="items" @action="handleAction" />

  <ResidentDetailDialog v-if="isDetailOpenRendered" v-model:open="isDetailOpen" :resident="resident" />
</template>
