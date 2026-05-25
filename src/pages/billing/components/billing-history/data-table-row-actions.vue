<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import { EllipsisIcon } from '@lucide/vue'

import { Modal, ModalContent } from '@/components/prop-ui/modal'

import type { Billing } from './data/schema'

import { billingSchema } from './data/schema'

interface DataTableRowActionsProps {
  row: Row<Billing>
}
const props = defineProps<DataTableRowActionsProps>()

const billing = computed(() => billingSchema.parse(props.row.original))
const showComponent = shallowRef<Component | null>(null)
const isOpen = ref(false)

type TCommand = 'detail'

const componentLoader: Record<TCommand, () => Promise<{ default: Component }>> = {
  detail: () => import('./billing-detail.vue'),
}

async function handleSelect(command: TCommand) {
  try {
    const { default: component } = await componentLoader[command]()
    showComponent.value = component
    isOpen.value = true
  }
  catch (e) {
    console.error(`加载 "${command}" 组件失败`, e)
  }
}
</script>

<template>
  <Modal v-model:open="isOpen">
    <UiDropdownMenu :modal="false">
      <UiDropdownMenuTrigger as-child>
        <UiButton
          variant="ghost"
          class="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <EllipsisIcon class="size-4" />
          <span class="sr-only">打开菜单</span>
        </UiButton>
      </UiDropdownMenuTrigger>
      <UiDropdownMenuContent>
        <UiDropdownMenuGroup>
          <UiDropdownMenuItem @select.stop="handleSelect('detail')">
            <span>详情</span>
          </UiDropdownMenuItem>
        </UiDropdownMenuGroup>
      </UiDropdownMenuContent>
    </UiDropdownMenu>
    <ModalContent>
      <component :is="showComponent" :billing="billing" />
    </ModalContent>
  </Modal>
</template>
