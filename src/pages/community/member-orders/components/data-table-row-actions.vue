<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { BanIcon, EyeIcon } from '@lucide/vue'

import type { RowActionItem } from '@/components/data-table'
import type { ICommunityMemberOrder } from '@/services/api/community-member-order.api'

import { DataTableRowActions } from '@/components/data-table'
import { useLazyMount } from '@/composables/use-lazy-mount'
import { canCancelMemberOrder } from '@/services/api/community-member-order.api'

import OrderCancelDialog from './order-cancel-dialog.vue'
import OrderDetailSheet from './order-detail-sheet.vue'

const props = defineProps<{ row: Row<ICommunityMemberOrder> }>()
const order = computed(() => props.row.original)
const isDetailOpen = ref(false)
const isDetailOpenRendered = useLazyMount(isDetailOpen)
const isCancelOpen = ref(false)
const isCancelOpenRendered = useLazyMount(isCancelOpen)

const items = computed(() => {
  const actions: RowActionItem[] = [
    { key: 'view', label: '查看', icon: EyeIcon },
  ]
  if (canCancelMemberOrder(order.value))
    actions.push({ key: 'cancel', label: '取消', icon: BanIcon, variant: 'destructive' as const })
  return actions
})

function handleAction(key: string) {
  if (key === 'view')
    isDetailOpen.value = true
  else if (key === 'cancel')
    isCancelOpen.value = true
}
</script>

<template>
  <DataTableRowActions :items="items" @action="handleAction" />

  <OrderDetailSheet
    v-if="isDetailOpenRendered"
    v-model:open="isDetailOpen"
    :order-id="order.orderId"
  />

  <OrderCancelDialog
    v-if="isCancelOpenRendered"
    v-model:open="isCancelOpen"
    :order="order"
  />
</template>
