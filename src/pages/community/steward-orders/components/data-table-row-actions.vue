<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { BanIcon, EyeIcon, UsersIcon } from '@lucide/vue'

import type { RowActionItem } from '@/components/data-table'
import type { IHousekeeperOrder } from '@/services/api/housekeeper-order.api'

import { DataTableRowActions } from '@/components/data-table'
import { useLazyMount } from '@/composables/use-lazy-mount'
import { canCancelHousekeeperOrder, canReassignHousekeeperOrder } from '@/services/api/housekeeper-order.rules'

import OrderCancelDialog from './order-cancel-dialog.vue'
import OrderDetailSheet from './order-detail-sheet.vue'
import OrderReassignDialog from './order-reassign-dialog.vue'

interface DataTableRowActionsProps {
  row: Row<IHousekeeperOrder>
}
const props = defineProps<DataTableRowActionsProps>()
const order = computed(() => props.row.original)

const isDetailOpen = ref(false)
const isDetailRendered = useLazyMount(isDetailOpen)
const isCancelOpen = ref(false)
const isCancelRendered = useLazyMount(isCancelOpen)
const isReassignOpen = ref(false)
const isReassignRendered = useLazyMount(isReassignOpen)

const items = computed(() => {
  const actions: RowActionItem[] = [
    { key: 'view', label: '查看详情', icon: EyeIcon },
  ]
  if (canReassignHousekeeperOrder(order.value))
    actions.push({ key: 'reassign', label: '改派', icon: UsersIcon })
  if (canCancelHousekeeperOrder(order.value))
    actions.push({ key: 'cancel', label: '取消', icon: BanIcon, variant: 'destructive' as const })
  return actions
})

function handleAction(key: string) {
  if (key === 'view')
    isDetailOpen.value = true
  else if (key === 'cancel')
    isCancelOpen.value = true
  else if (key === 'reassign')
    isReassignOpen.value = true
}
</script>

<template>
  <DataTableRowActions :items="items" @action="handleAction" />

  <OrderDetailSheet
    v-if="isDetailRendered"
    v-model:open="isDetailOpen"
    :order-id="order.orderId"
  />

  <OrderCancelDialog
    v-if="isCancelRendered"
    v-model:open="isCancelOpen"
    :order="order"
  />

  <OrderReassignDialog
    v-if="isReassignRendered"
    v-model:open="isReassignOpen"
    :order="order"
  />
</template>
