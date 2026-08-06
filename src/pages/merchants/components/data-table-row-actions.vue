<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import { BotIcon, PencilIcon, StoreIcon, Trash2Icon } from '@lucide/vue'

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

const items = [
  { key: 'edit', label: '编辑', icon: PencilIcon },
  { key: 'assign', label: '分配AI工具', icon: BotIcon },
  { key: 'enter', label: '进入商户后台', icon: StoreIcon },
  { key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' as const },
]

function handleSelect(command: 'edit' | 'delete') {
  showComponent.value = command === 'edit' ? MerchantEdit : MerchantDelete
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

function handleAction(key: string) {
  if (key === 'edit')
    handleSelect('edit')
  else if (key === 'assign')
    handleAssign()
  else if (key === 'enter')
    handleEnterBusiness()
  else if (key === 'delete')
    handleSelect('delete')
}
</script>

<template>
  <Modal v-model:open="isOpen">
    <DataTableRowActions
      :items="items"
      content-width="w-[180px]"
      @action="handleAction"
    />

    <ModalContent>
      <component
        :is="showComponent"
        :merchant="merchant"
        @close="isOpen = false"
      />
    </ModalContent>
  </Modal>
</template>
