<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import type { Component } from 'vue'

import { EllipsisIcon, EyeIcon, PencilIcon } from '@lucide/vue'

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
type TCommand = 'detail' | 'edit' | 'delete'

function handleSelect(command: TCommand) {
  if (command === 'edit')
    showComponent.value = ActivityEdit
  else if (command === 'delete')
    showComponent.value = ActivityDelete
  else
    showComponent.value = ActivityDetail
  isOpen.value = true
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
        <UiDropdownMenuItem @click.stop="handleSelect('detail')">
          <EyeIcon class="size-4 mr-2" />
          查看详情
        </UiDropdownMenuItem>

        <UiDropdownMenuItem @click.stop="handleSelect('edit')">
          <PencilIcon class="size-4 mr-2" />
          编辑
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
