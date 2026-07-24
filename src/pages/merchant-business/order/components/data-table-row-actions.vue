<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { EllipsisIcon, EyeIcon } from '@lucide/vue'

import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'

import type { Order } from '../data/schema'

import OrderDetail from './order-detail.vue'

interface DataTableRowActionsProps {
  row: Row<Order>
}
const props = defineProps<DataTableRowActionsProps>()
const order = computed(() => props.row.original)

const isOpen = ref(false)

function handleDetail() {
  isOpen.value = true
}
</script>

<template>
  <Modal v-model:open="isOpen">
    <UiDropdownMenu>
      <UiDropdownMenuTrigger as-child>
        <UiButton
          variant="ghost"
          class="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <EllipsisIcon class="size-4" />
          <span class="sr-only">Open menu</span>
        </UiButton>
      </UiDropdownMenuTrigger>
      <UiDropdownMenuContent align="end" class="w-[160px]">
        <UiDropdownMenuItem @click.stop="handleDetail">
          <EyeIcon class="size-4 mr-2" />
          查看详情
        </UiDropdownMenuItem>
      </UiDropdownMenuContent>
    </UiDropdownMenu>

    <ModalContent class="sm:max-w-[560px]">
      <ModalHeader>
        <ModalTitle>订单详情</ModalTitle>
      </ModalHeader>
      <OrderDetail :orderid="order.orderid" />
    </ModalContent>
  </Modal>
</template>
