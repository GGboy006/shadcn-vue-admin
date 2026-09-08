<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import { ExternalLinkIcon, PencilIcon, Trash2Icon } from '@lucide/vue'

import { DataTableRowActions } from '@/components/data-table'
import { Modal, ModalContent } from '@/components/prop-ui/modal'
import { useLazyMount } from '@/composables/use-lazy-mount'

import type { Merchant } from '../../merchants/data/schema'

import MerchantDelete from '../../merchants/components/merchant-delete.vue'
import MerchantEdit from '../../merchants/components/merchant-edit.vue'
import { resolveExternalUrl } from '../utils/external-url'

interface DataTableRowActionsProps {
  row: Row<Merchant>
}
const props = defineProps<DataTableRowActionsProps>()
const property = computed(() => props.row.original)
const isEditOpen = ref(false)
const isEditOpenRendered = useLazyMount(isEditOpen)
const isDeleteOpen = ref(false)
const isDeleteOpenRendered = useLazyMount(isDeleteOpen)

const externalUrl = computed(() => resolveExternalUrl(property.value.externalUrl))

// 物业是外部产品：不参与 AI 工具分配，也没有商户后台，只跳外链
const items = computed(() => [
  { key: 'edit', label: '编辑', icon: PencilIcon },
  {
    key: 'open',
    label: externalUrl.value ? '打开外部链接' : '未配置外部链接',
    icon: ExternalLinkIcon,
    disabled: !externalUrl.value,
  },
  { key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' as const },
])

function handleAction(key: string) {
  if (key === 'edit')
    isEditOpen.value = true
  else if (key === 'open' && externalUrl.value)
    window.open(externalUrl.value, '_blank', 'noopener,noreferrer')
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
