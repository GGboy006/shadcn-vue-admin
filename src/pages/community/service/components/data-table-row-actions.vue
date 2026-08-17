<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { ICommunityService } from '@/services/api/community-service.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'
import { useLazyMount } from '@/composables/use-lazy-mount'

import ServiceDeleteDialog from './service-delete-dialog.vue'
import ServiceDetailDialog from './service-detail-dialog.vue'
import ServiceFormSheet from './service-form-sheet.vue'

const props = defineProps<{ row: Row<ICommunityService> }>()
const service = computed(() => props.row.original)
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

  <ServiceDetailDialog v-if="isDetailOpenRendered" v-model:open="isDetailOpen" :service="service" />
  <ServiceFormSheet v-if="isEditOpenRendered" v-model:open="isEditOpen" :service="service" />
  <ServiceDeleteDialog v-if="isDeleteOpenRendered" v-model:open="isDeleteOpen" :service="service" />
</template>
