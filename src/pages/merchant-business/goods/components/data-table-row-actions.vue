<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

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
type TCommand = 'detail' | 'edit' | 'delete'

function handleSelect(command: TCommand) {
  if (command === 'edit')
    showComponent.value = GoodsEdit
  else if (command === 'delete')
    showComponent.value = GoodsDelete
  else
    showComponent.value = GoodsDetail
  isOpen.value = true
}
</script>

<template>
  <Modal v-model:open="isOpen">
    <DataTableRowActions
      view-text="查看详情"
      content-width="w-[180px]"
      @view="handleSelect('detail')"
      @edit="handleSelect('edit')"
      @delete="handleSelect('delete')"
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
