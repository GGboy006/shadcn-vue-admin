<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import { EyeIcon, PencilIcon, Trash2Icon } from '@lucide/vue'

import { DataTableRowActions } from '@/components/data-table'
import { FormSheet, FormSheetContent } from '@/components/prop-ui/form-sheet'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'
import { useLazyMount } from '@/composables/use-lazy-mount'

import type { Goods } from '../data/schema'

import GoodsDelete from './goods-delete.vue'
import GoodsDetail from './goods-detail.vue'
import GoodsEdit from './goods-edit.vue'

interface DataTableRowActionsProps {
  row: Row<Goods>
}
const props = defineProps<DataTableRowActionsProps>()
const goods = computed(() => props.row.original)

// 编辑走 FormSheet(响应式抽屉)
const isEditOpen = ref(false)
const isEditOpenRendered = useLazyMount(isEditOpen)
// 查看 / 删除共用 Modal(保留原逻辑,只摘出编辑)
const isModalOpen = ref(false)
const isModalOpenRendered = useLazyMount(isModalOpen)
const showComponent = shallowRef<Component | null>(null)

const items = [
  { key: 'view', label: '查看详情', icon: EyeIcon },
  { key: 'edit', label: '编辑', icon: PencilIcon },
  { key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' as const },
]

function handleAction(key: string) {
  if (key === 'edit') {
    isEditOpen.value = true
    return
  }
  if (key === 'view')
    showComponent.value = GoodsDetail
  else if (key === 'delete')
    showComponent.value = GoodsDelete
  isModalOpen.value = true
}
</script>

<template>
  <!-- 操作列:dropdown 触发器 -->
  <DataTableRowActions
    :items="items"
    content-width="w-[180px]"
    @action="handleAction"
  />

  <!-- 编辑:FormSheet(桌面右侧抽屉 / 移动底部抽屉) -->
  <FormSheet v-if="isEditOpenRendered" v-model:open="isEditOpen">
    <FormSheetContent>
      <GoodsEdit
        :context="goods.uniqueCode ? { goodsCode: goods.uniqueCode } : undefined"
        @close="isEditOpen = false"
      />
    </FormSheetContent>
  </FormSheet>

  <!-- 查看 / 删除:保留 Modal(按需求暂不改) -->
  <Modal v-if="isModalOpenRendered" v-model:open="isModalOpen">
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
        :goods="goods"
        @close="isModalOpen = false"
      />
    </ModalContent>
  </Modal>
</template>
