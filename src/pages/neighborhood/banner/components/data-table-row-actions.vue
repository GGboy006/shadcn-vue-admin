<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { INeighborhoodBanner } from '@/services/api/neighborhood-banner.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'

import BannerDeleteDialog from './banner-delete-dialog.vue'
import BannerDetailDialog from './banner-detail-dialog.vue'
import BannerFormSheet from './banner-form-sheet.vue'

const props = defineProps<{ row: Row<INeighborhoodBanner> }>()
const banner = computed(() => props.row.original)
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

  <BannerDetailDialog v-model:open="isDetailOpen" :unique-code="banner?.uniqueCode" />
  <BannerFormSheet v-model:open="isEditOpen" :banner="banner" />
  <BannerDeleteDialog v-model:open="isDeleteOpen" :banner="banner" />
</template>
