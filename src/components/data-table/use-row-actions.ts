import { ref } from 'vue'

/**
 * 表格行操作(查看/编辑/删除)的弹窗开关状态。
 * 与 DataTableRowActions 配合使用:组件 emit 事件 -> open* 置 true -> 对应弹窗 v-model:open 受控。
 */
export function useRowActions() {
  const isDetailOpen = ref(false)
  const isEditOpen = ref(false)
  const isDeleteOpen = ref(false)

  return {
    isDetailOpen,
    isEditOpen,
    isDeleteOpen,
    openDetail: () => {
      isDetailOpen.value = true
    },
    openEdit: () => {
      isEditOpen.value = true
    },
    openDelete: () => {
      isDeleteOpen.value = true
    },
  }
}
