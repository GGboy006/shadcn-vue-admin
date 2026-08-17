<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { ICommunityPhone } from '@/services/api/community-phone.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'
import { useLazyMount } from '@/composables/use-lazy-mount'

import PhoneDeleteDialog from './phone-delete-dialog.vue'
import PhoneDetailDialog from './phone-detail-dialog.vue'
import PhoneFormSheet from './phone-form-sheet.vue'

const props = defineProps<{ row: Row<ICommunityPhone> }>()
const phone = computed(() => props.row.original)
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

  <PhoneDetailDialog v-if="isDetailOpenRendered" v-model:open="isDetailOpen" :phone="phone" />
  <PhoneFormSheet v-if="isEditOpenRendered" v-model:open="isEditOpen" :phone="phone" />
  <PhoneDeleteDialog v-if="isDeleteOpenRendered" v-model:open="isDeleteOpen" :phone="phone" />
</template>
