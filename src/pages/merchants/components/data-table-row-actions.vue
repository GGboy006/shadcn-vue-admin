<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

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

// 编辑走 FormSheet(MerchantEdit 自带响应式外壳)
const isEditOpen = ref(false)

// 删除保留 Modal
const isDeleteOpen = ref(false)

const items = [
  { key: 'edit', label: '编辑', icon: PencilIcon },
  { key: 'assign', label: '分配AI工具', icon: BotIcon },
  { key: 'enter', label: '进入商户后台', icon: StoreIcon },
  { key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' as const },
]

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
    isEditOpen.value = true
  else if (key === 'assign')
    handleAssign()
  else if (key === 'enter')
    handleEnterBusiness()
  else if (key === 'delete')
    isDeleteOpen.value = true
}
</script>

<template>
  <!-- 操作列:dropdown 触发器 -->
  <DataTableRowActions
    :items="items"
    content-width="w-[180px]"
    @action="handleAction"
  />

  <!-- 编辑:FormSheet(MerchantEdit 自带响应式外壳) -->
  <MerchantEdit v-model:open="isEditOpen" :merchant="merchant" @close="isEditOpen = false" />

  <!-- 删除:保留 Modal -->
  <Modal v-model:open="isDeleteOpen">
    <ModalContent>
      <MerchantDelete :merchant="merchant" @close="isDeleteOpen = false" />
    </ModalContent>
  </Modal>
</template>
