<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { ICommunityMemberPackage } from '@/services/api/community-member-price.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'
import { useLazyMount } from '@/composables/use-lazy-mount'

import PackageDeleteDialog from './package-delete-dialog.vue'
import PackageDetailDialog from './package-detail-dialog.vue'
import PackageFormSheet from './package-form-sheet.vue'

const props = defineProps<{ row: Row<ICommunityMemberPackage> }>()
const pkg = computed(() => props.row.original)
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

  <PackageDetailDialog v-if="isDetailOpenRendered" v-model:open="isDetailOpen" :pkg="pkg" />
  <PackageFormSheet v-if="isEditOpenRendered" v-model:open="isEditOpen" :pkg="pkg" />
  <PackageDeleteDialog v-if="isDeleteOpenRendered" v-model:open="isDeleteOpen" :pkg="pkg" />
</template>
