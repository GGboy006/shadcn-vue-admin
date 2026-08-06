<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import { EyeIcon, PencilIcon, Trash2Icon } from '@lucide/vue'

import { DataTableRowActions } from '@/components/data-table'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'

import type { Goods } from '../data/schema'

import GoodsDelete from './goods-delete.vue'
import GoodsDetail from './goods-detail.vue'
import GoodsEdit from './goods-edit.vue'

interface DataTableRowActionsProps {
  row: Row<Goods>
}
const props = defineProps<DataTableRowActionsProps>()
const goods = computed(() => props.row.original)

const isOpen = ref(false)
const showComponent = shallowRef<Component | null>(null)

const items = [
  { key: 'view', label: '查看详情', icon: EyeIcon },
  { key: 'edit', label: '编辑', icon: PencilIcon },
  { key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' as const },
]

function handleAction(key: string) {
  if (key === 'view')
    showComponent.value = GoodsDetail
  else if (key === 'edit')
    showComponent.value = GoodsEdit
  else if (key === 'delete')
    showComponent.value = GoodsDelete
  isOpen.value = true
}
</script>

<template>
  <Modal v-model:open="isOpen">
    <DataTableRowActions
      :items="items"
      content-width="w-[180px]"
      @action="handleAction"
    />
    <ModalContent :class="showComponent === GoodsDetail ? 'sm:max-w-[640px]' : ''">
      <template v-if="showComponent === GoodsDetail">
        <ModalHeader>
          <ModalTitle>商品详情</ModalTitle>
        </ModalHeader>
        <GoodsDetail :goods-code="goods.uniqueCode" />
      </template>
      <component
        :is="showComponent"
        v-else
        :context="goods.uniqueCode ? { goodsCode: goods.uniqueCode } : undefined"
        :goods="goods"
        @close="isOpen = false"
      />
    </ModalContent>
  </Modal>
</template>
