<script lang="ts" setup generic="T = Task">
import type { Table as VueTable } from '@tanstack/vue-table'

import { toast } from 'vue-sonner'

import ConfirmDialog from '@/components/confirm-dialog.vue'

import type { Task } from '../data/schema'

const { table } = defineProps<{
  table: VueTable<T>
}>()

const openModel = defineModel<boolean>('open', {
  default: false,
})

const CONFIRM_WORD = '删除'

const confirmValue = ref('')

const selectedRows = computed(() => table.getSelectedRowModel().rows)
const selectedCount = computed(() => selectedRows.value.length || 0)
function handleConfirm() {
  if (confirmValue.value !== CONFIRM_WORD) {
    toast.error(`请输入 "${CONFIRM_WORD}" 以确认删除。`)
    return
  }

  openModel.value = false

  toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
    loading: '正在删除任务...',
    success: () => {
      table.resetRowSelection()
      return `成功删除 ${selectedRows.value.length} 个任务。`
    },
    error: '删除任务失败。',
  })
}
</script>

<template>
  <ConfirmDialog
    v-model:open="openModel"
    confirm-button-text="删除"
    destructive
    :disabled="confirmValue.trim() !== CONFIRM_WORD"
    @confirm="handleConfirm"
  >
    <template #title>
      删除 {{ selectedCount }} 个任务？
    </template>
    <template #description>
      确定要删除选中的任务吗？<br>
      此操作不可撤销。
    </template>

    <template #default>
      <UiLabel class="my-4 flex flex-col items-start gap-1.5">
        <span>请输入 "{{ CONFIRM_WORD }}" 以确认：</span>
        <UiInput
          v-model="confirmValue"
          :placeholder="`输入 &quot;${CONFIRM_WORD}&quot; 确认删除`"
        />
      </UiLabel>

      <UiAlert variant="destructive">
        <UiAlertTitle>警告！</UiAlertTitle>
        <UiAlertDescription>
          请谨慎操作，此操作无法回滚。
        </UiAlertDescription>
      </UiAlert>
    </template>
  </ConfirmDialog>
</template>
