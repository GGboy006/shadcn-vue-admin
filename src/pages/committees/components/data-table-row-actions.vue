<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { StoreIcon } from '@lucide/vue'

import { DataTableRowActions, useRowActions } from '@/components/data-table'
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
const { isEditOpen, isDeleteOpen, openEdit, openDelete } = useRowActions()

const { enterMerchantBusiness } = useEnterMerchantBusiness()
function handleEnterBusiness() {
  // 代客进入居委会后台(居委会 userType=6,已修复跳转到 /neighborhood/home)
  enterMerchantBusiness(committee.value.merchantId, committee.value.merchantName)
}
</script>

<template>
  <DataTableRowActions
    :show-view="false"
    content-width="w-[180px]"
    @edit="openEdit"
    @delete="openDelete"
  >
    <template #extra-items>
      <UiDropdownMenuItem @click.stop="handleEnterBusiness">
        <StoreIcon class="mr-2 size-4" />
        进入居委会后台
      </UiDropdownMenuItem>
    </template>
  </DataTableRowActions>

  <!-- 编辑:Sheet(右侧抽屉,走 /station/neighborhood) -->
  <CommitteeFormSheet v-model:open="isEditOpen" :committee="committee" />

  <!-- 删除:复用商户删除组件(删除接口共用 /station/merchant/{id},文档 1.5) -->
  <Modal v-model:open="isDeleteOpen">
    <ModalContent>
      <MerchantDelete :merchant="committee" @close="isDeleteOpen = false" />
    </ModalContent>
  </Modal>
</template>
