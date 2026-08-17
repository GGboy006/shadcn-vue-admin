<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { ICommunityCate } from '@/services/api/community-cate.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'
import { useLazyMount } from '@/composables/use-lazy-mount'

import CateDeleteDialog from './cate-delete-dialog.vue'
import CateDetailDialog from './cate-detail-dialog.vue'
import CateFormSheet from './cate-form-sheet.vue'

const props = defineProps<{ row: Row<ICommunityCate> }>()
const cate = computed(() => props.row.original)
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

  <CateDetailDialog v-if="isDetailOpenRendered" v-model:open="isDetailOpen" :cate="cate" />
  <CateFormSheet v-if="isEditOpenRendered" v-model:open="isEditOpen" :cate="cate" />
  <CateDeleteDialog v-if="isDeleteOpenRendered" v-model:open="isDeleteOpen" :cate="cate" />
</template>
