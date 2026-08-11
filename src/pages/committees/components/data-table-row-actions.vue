<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { BotIcon, PencilIcon, StoreIcon, Trash2Icon } from '@lucide/vue'

import { DataTableRowActions } from '@/components/data-table'
import { Modal, ModalContent } from '@/components/prop-ui/modal'
import { useEnterMerchantBusiness } from '@/composables/use-enter-merchant-business'

import type { Merchant } from '../../merchants/data/schema'

import MerchantDelete from '../../merchants/components/merchant-delete.vue'
import CommitteeFormSheet from './committee-form-sheet.vue'

interface DataTableRowActionsProps {
  row: Row<Merchant>
}
const props = defineProps<DataTableRowActionsProps>()
const committee = computed(() => props.row.original)
const isEditOpen = ref(false)
const isDeleteOpen = ref(false)

const router = useRouter()

const items = [
  { key: 'edit', label: '编辑', icon: PencilIcon },
  { key: 'assign', label: '分配AI工具', icon: BotIcon },
  { key: 'enter', label: '进入居委会后台', icon: StoreIcon },
  { key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' as const },
]

const { enterMerchantBusiness } = useEnterMerchantBusiness()
function handleEnterBusiness() {
  // 代客进入居委会后台(居委会 userType=6,已修复跳转到 /neighborhood/home)
  enterMerchantBusiness(committee.value.merchantId, committee.value.merchantName)
}

// 分配AI工具:跳转居委会专属路由(复用商户分配页组件),
// 独立路径避免侧边栏误高亮「商户管理」(前缀匹配 /merchants)。
function handleAssign() {
  router.push(`/committees/${committee.value.merchantId}/assign`)
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
  <DataTableRowActions
    :items="items"
    content-width="w-[180px]"
    @action="handleAction"
  />

  <!-- 编辑:Sheet(右侧抽屉,走 /station/neighborhood) -->
  <CommitteeFormSheet v-model:open="isEditOpen" :committee="committee" />

  <!-- 删除:复用商户删除组件(删除接口共用 /station/merchant/{id},文档 1.5) -->
  <Modal v-model:open="isDeleteOpen">
    <ModalContent>
      <MerchantDelete :merchant="committee" @close="isDeleteOpen = false" />
    </ModalContent>
  </Modal>
</template>
