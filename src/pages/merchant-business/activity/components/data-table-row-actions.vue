<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import { EyeIcon, PencilIcon, Trash2Icon } from '@lucide/vue'

import { DataTableRowActions } from '@/components/data-table'
import { FormSheet, FormSheetContent } from '@/components/prop-ui/form-sheet'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'
import { useLazyMount } from '@/composables/use-lazy-mount'

import type { Activity } from '../data/schema'

import ActivityDelete from './activity-delete.vue'
import ActivityDetail from './activity-detail.vue'
import ActivityEdit from './activity-edit.vue'

interface DataTableRowActionsProps {
  row: Row<Activity>
}
const props = defineProps<DataTableRowActionsProps>()
const activity = computed(() => props.row.original)

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
    showComponent.value = ActivityDetail
  else if (key === 'delete')
    showComponent.value = ActivityDelete
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
      <ActivityEdit
        :context="activity.uniqueCode ? { uniqueCode: activity.uniqueCode, initialValues: { name: activity.name, poster: activity.poster, detailPoster: activity.detailPoster, sponsorName: activity.sponsorName, cateCode: activity.cateCode, cateName: activity.cateName, describes: activity.describes, content: activity.content, address: activity.address, isCharge: activity.isCharge, salePrice: activity.salePrice, startTime: activity.startTime, endTime: activity.endTime, torder: activity.torder, isRecommend: activity.isRecommend, isEnable: activity.isEnable } } : undefined"
        @close="isEditOpen = false"
      />
    </FormSheetContent>
  </FormSheet>

  <!-- 查看 / 删除:保留 Modal(按需求暂不改) -->
  <Modal v-if="isModalOpenRendered" v-model:open="isModalOpen">
    <ModalContent :class="showComponent === ActivityDetail ? 'sm:max-w-[640px]' : ''">
      <template v-if="showComponent === ActivityDetail">
        <ModalHeader>
          <ModalTitle>活动详情</ModalTitle>
        </ModalHeader>
        <ActivityDetail :activity-code="activity.uniqueCode" />
      </template>
      <component
        :is="showComponent"
        v-else
        :activity="activity"
        @close="isModalOpen = false"
      />
    </ModalContent>
  </Modal>
</template>
