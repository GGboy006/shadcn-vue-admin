<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import { BotIcon, StoreIcon } from '@lucide/vue'

import { DataTableRowActions } from '@/components/data-table'
import { Modal, ModalContent } from '@/components/prop-ui/modal'
import { useEnterMerchantBusiness } from '@/composables/use-enter-merchant-business'

import type { Merchant } from '../data/schema'

import MerchantDelete from './merchant-delete.vue'
import MerchantEdit from './merchant-edit.vue'

interface DataTableRowActionsProps {
  row: Row<Merchant>
}
const props = defineProps<DataTableRowActionsProps>()
const merchant = computed(() => props.row.original)

const router = useRouter()
const isOpen = ref(false)

const showComponent = shallowRef<Component | null>(null)
type TCommand = 'edit' | 'delete'

function handleSelect(command: TCommand) {
  if (command === 'edit') {
    showComponent.value = MerchantEdit
  }
  else {
    showComponent.value = MerchantDelete
  }
  isOpen.value = true
}

function handleAssign() {
  router.push(`/merchants/${merchant.value.merchantId}`)
}

const { enterMerchantBusiness } = useEnterMerchantBusiness()
function handleEnterBusiness() {
  // 同窗口跳转:存入代客 store(带商户名),菜单自动重载为商户后台
  enterMerchantBusiness(merchant.value.merchantId, merchant.value.merchantName)
}
</script>

<template>
  <Modal v-model:open="isOpen">
    <DataTableRowActions
      :show-view="false"
      content-width="w-[180px]"
      @edit="handleSelect('edit')"
      @delete="handleSelect('delete')"
    >
      <template #extra-items>
        <UiDropdownMenuItem @click.stop="handleAssign">
          <BotIcon class="mr-2 size-4" />
          分配AI工具
        </UiDropdownMenuItem>

        <UiDropdownMenuItem @click.stop="handleEnterBusiness">
          <StoreIcon class="mr-2 size-4" />
          进入商户后台
        </UiDropdownMenuItem>
      </template>
    </DataTableRowActions>

    <ModalContent>
      <component
        :is="showComponent"
        :merchant="merchant"
        @close="isOpen = false"
      />
    </ModalContent>
  </Modal>
</template>
