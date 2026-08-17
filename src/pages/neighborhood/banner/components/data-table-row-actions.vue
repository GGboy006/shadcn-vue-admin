<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { INeighborhoodBanner } from '@/services/api/neighborhood-banner.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'
import { useLazyMount } from '@/composables/use-lazy-mount'

import BannerDeleteDialog from './banner-delete-dialog.vue'
import BannerDetailDialog from './banner-detail-dialog.vue'
import BannerFormSheet from './banner-form-sheet.vue'

const props = defineProps<{ row: Row<INeighborhoodBanner> }>()
const banner = computed(() => props.row.original)
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

  <BannerDetailDialog v-if="isDetailOpenRendered" v-model:open="isDetailOpen" :unique-code="banner?.uniqueCode" />
  <BannerFormSheet v-if="isEditOpenRendered" v-model:open="isEditOpen" :banner="banner" />
  <BannerDeleteDialog v-if="isDeleteOpenRendered" v-model:open="isDeleteOpen" :banner="banner" />
</template>
