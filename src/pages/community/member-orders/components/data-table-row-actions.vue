<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { ICommunityMemberOrder } from '@/services/api/community-member-order.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'
import { useLazyMount } from '@/composables/use-lazy-mount'

import OrderDetailSheet from './order-detail-sheet.vue'

const props = defineProps<{ row: Row<ICommunityMemberOrder> }>()
const order = computed(() => props.row.original)
const isDetailOpen = ref(false)
const isDetailOpenRendered = useLazyMount(isDetailOpen)
const { items, handleAction } = useRowActions({
  view: () => { isDetailOpen.value = true },
})
</script>

<template>
  <DataTableRowActions :items="items" @action="handleAction" />

  <OrderDetailSheet
    v-if="isDetailOpenRendered"
    v-model:open="isDetailOpen"
    :unique-code="order.uniqueCode"
  />
</template>
