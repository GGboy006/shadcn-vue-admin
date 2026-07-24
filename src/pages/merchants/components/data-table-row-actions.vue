<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import { BotIcon, EllipsisIcon, PencilIcon, StoreIcon } from '@lucide/vue'

import { Modal, ModalContent } from '@/components/prop-ui/modal'
import { useMerchantBusinessStore } from '@/stores/merchant-business'

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

function handleEnterBusiness() {
  // 同窗口跳转:存入代客 store(带商户名),菜单自动重载为商户后台
  const store = useMerchantBusinessStore()
  store.enterProxy(merchant.value.merchantId, merchant.value.merchantName)
  router.push({ path: '/merchant-business', query: { mId: merchant.value.merchantId } })
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
      <UiDropdownMenuContent align="end" class="w-[180px]">
        <UiDropdownMenuItem @click.stop="handleSelect('edit')">
          <PencilIcon class="size-4 mr-2" />
          编辑
        </UiDropdownMenuItem>

        <UiDropdownMenuItem @click.stop="handleAssign">
          <BotIcon class="size-4 mr-2" />
          分配AI工具
        </UiDropdownMenuItem>

        <UiDropdownMenuItem @click.stop="handleEnterBusiness">
          <StoreIcon class="size-4 mr-2" />
          进入商户后台
        </UiDropdownMenuItem>

        <UiDropdownMenuSeparator />

        <UiDropdownMenuItem
          class="text-destructive focus:text-destructive"
          @click.stop="handleSelect('delete')"
        >
          删除
          <UiDropdownMenuShortcut>⌘⌫</UiDropdownMenuShortcut>
        </UiDropdownMenuItem>
      </UiDropdownMenuContent>
    </UiDropdownMenu>

    <ModalContent>
      <component
        :is="showComponent"
        :merchant="merchant"
        @close="isOpen = false"
      />
    </ModalContent>
  </Modal>
</template>
