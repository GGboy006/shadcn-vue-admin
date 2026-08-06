<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import { EyeIcon, PencilIcon, Trash2Icon } from '@lucide/vue'

import { DataTableRowActions } from '@/components/data-table'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/prop-ui/modal'

import type { Activity } from '../data/schema'

import ActivityDelete from './activity-delete.vue'
import ActivityDetail from './activity-detail.vue'
import ActivityEdit from './activity-edit.vue'

interface DataTableRowActionsProps {
  row: Row<Activity>
}
const props = defineProps<DataTableRowActionsProps>()
const activity = computed(() => props.row.original)

const isOpen = ref(false)
const showComponent = shallowRef<Component | null>(null)

const items = [
  { key: 'view', label: '查看详情', icon: EyeIcon },
  { key: 'edit', label: '编辑', icon: PencilIcon },
  { key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' as const },
]

function handleAction(key: string) {
  if (key === 'view')
    showComponent.value = ActivityDetail
  else if (key === 'edit')
    showComponent.value = ActivityEdit
  else if (key === 'delete')
    showComponent.value = ActivityDelete
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
        :context="activity.uniqueCode ? { uniqueCode: activity.uniqueCode, initialValues: { name: activity.name, poster: activity.poster, detailPoster: activity.detailPoster, sponsorName: activity.sponsorName, cateCode: activity.cateCode, cateName: activity.cateName, describes: activity.describes, content: activity.content, address: activity.address, isCharge: activity.isCharge, salePrice: activity.salePrice, startTime: activity.startTime, endTime: activity.endTime, torder: activity.torder, isRecommend: activity.isRecommend, isEnable: activity.isEnable } } : undefined"
        :activity="activity"
        @close="isOpen = false"
      />
    </ModalContent>
  </Modal>
</template>
