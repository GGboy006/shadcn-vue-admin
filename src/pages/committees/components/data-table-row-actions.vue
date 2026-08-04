<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { EllipsisIcon, PencilIcon, StoreIcon } from '@lucide/vue'

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

const { enterMerchantBusiness } = useEnterMerchantBusiness()
function handleEnterBusiness() {
  // 代客进入居委会后台(居委会 userType=6,已修复跳转到 /neighborhood/home)
  enterMerchantBusiness(committee.value.merchantId, committee.value.merchantName)
}
</script>

<template>
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
    <UiDropdownMenuContent align="end" class="w-[180px]">
      <UiDropdownMenuItem @click.stop="isEditOpen = true">
        <PencilIcon class="mr-2 size-4" />
        编辑
      </UiDropdownMenuItem>

      <UiDropdownMenuItem @click.stop="handleEnterBusiness">
        <StoreIcon class="mr-2 size-4" />
        进入居委会后台
      </UiDropdownMenuItem>

      <UiDropdownMenuSeparator />

      <UiDropdownMenuItem
        class="text-destructive focus:text-destructive"
        @click.stop="isDeleteOpen = true"
      >
        删除
        <UiDropdownMenuShortcut>⌘⌫</UiDropdownMenuShortcut>
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>

  <!-- 编辑:Sheet(右侧抽屉,走 /station/neighborhood) -->
  <CommitteeFormSheet
    v-model:open="isEditOpen"
    :committee="committee"
  />

  <!-- 删除:复用商户删除组件(删除接口共用 /station/merchant/{id},文档 1.5) -->
  <Modal v-model:open="isDeleteOpen">
    <ModalContent>
      <MerchantDelete
        :merchant="committee"
        @close="isDeleteOpen = false"
      />
    </ModalContent>
  </Modal>
</template>
