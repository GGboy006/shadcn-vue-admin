<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { EyeIcon } from '@lucide/vue'

import { DataTableRowActions } from '@/components/data-table'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'

import type { Order } from '../data/schema'

import OrderDetail from './order-detail.vue'

interface DataTableRowActionsProps {
  row: Row<Order>
}
const props = defineProps<DataTableRowActionsProps>()
const order = computed(() => props.row.original)

const isOpen = ref(false)

const items = [
  { key: 'view', label: '查看详情', icon: EyeIcon },
]

function handleAction(key: string) {
  if (key === 'view')
    isOpen.value = true
}
</script>

<template>
  <Modal v-model:open="isOpen">
    <DataTableRowActions :items="items" @action="handleAction" />
    <ModalContent class="sm:max-w-[560px]">
      <ModalHeader>
        <ModalTitle>订单详情</ModalTitle>
      </ModalHeader>
      <OrderDetail :orderid="order.orderid" />
    </ModalContent>
  </Modal>
</template>
