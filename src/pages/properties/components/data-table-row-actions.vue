<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { BotIcon, PencilIcon, StoreIcon, Trash2Icon } from '@lucide/vue'

import { DataTableRowActions } from '@/components/data-table'
import { Modal, ModalContent } from '@/components/prop-ui/modal'
import { useEnterMerchantBusiness } from '@/composables/use-enter-merchant-business'
import { useLazyMount } from '@/composables/use-lazy-mount'

import type { Merchant } from '../../merchants/data/schema'

import MerchantDelete from '../../merchants/components/merchant-delete.vue'
import MerchantEdit from '../../merchants/components/merchant-edit.vue'

interface DataTableRowActionsProps {
  row: Row<Merchant>
}
const props = defineProps<DataTableRowActionsProps>()
const property = computed(() => props.row.original)
const isEditOpen = ref(false)
const isEditOpenRendered = useLazyMount(isEditOpen)
const isDeleteOpen = ref(false)
const isDeleteOpenRendered = useLazyMount(isDeleteOpen)
const router = useRouter()

const items = [
  { key: 'edit', label: '编辑', icon: PencilIcon },
  { key: 'assign', label: '分配AI工具', icon: BotIcon },
  { key: 'enter', label: '进入商户后台', icon: StoreIcon },
  { key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' as const },
]

const { enterMerchantBusiness } = useEnterMerchantBusiness()
function handleEnterBusiness() {
  enterMerchantBusiness(property.value.merchantId, property.value.merchantName)
}

// 分配AI工具:跳转物业专属路由(复用商户分配页组件),
// 独立路径避免侧边栏误高亮「商户管理」(前缀匹配 /merchants)。
function handleAssign() {
  router.push(`/properties/${property.value.merchantId}/assign`)
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

  <!-- 编辑:复用商户编辑组件(MerchantEdit 按 type 通用) -->
  <MerchantEdit v-if="isEditOpenRendered" v-model:open="isEditOpen" :merchant="property" @close="isEditOpen = false" />

  <!-- 删除:复用商户删除组件(删除接口共用 /station/merchant/{id}) -->
  <Modal v-if="isDeleteOpenRendered" v-model:open="isDeleteOpen">
    <ModalContent>
      <MerchantDelete :merchant="property" @close="isDeleteOpen = false" />
    </ModalContent>
  </Modal>
</template>
