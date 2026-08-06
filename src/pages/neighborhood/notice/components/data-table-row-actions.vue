<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'

import type { INeighborhoodNotice } from '@/services/api/neighborhood-notice.api'

import { DataTableRowActions, useRowActions } from '@/components/data-table'

import NoticeDeleteDialog from './notice-delete-dialog.vue'
import NoticeDetailDialog from './notice-detail-dialog.vue'
import NoticeFormSheet from './notice-form-sheet.vue'

const props = defineProps<{ row: Row<INeighborhoodNotice> }>()
const notice = computed(() => props.row.original)
const { isDetailOpen, isEditOpen, isDeleteOpen, openDetail, openEdit, openDelete } = useRowActions()
</script>

<template>
  <DataTableRowActions @view="openDetail" @edit="openEdit" @delete="openDelete" />

  <!-- 查看:Dialog(居中弹窗,只读详情) -->
  <NoticeDetailDialog v-model:open="isDetailOpen" :unique-code="notice?.uniqueCode" />

  <!-- 新增/编辑:Sheet(右侧滑出抽屉,表单) -->
  <NoticeFormSheet v-model:open="isEditOpen" :notice="notice" />

  <!-- 删除:AlertDialog(确认弹窗) -->
  <NoticeDeleteDialog v-model:open="isDeleteOpen" :notice="notice" />
</template>
