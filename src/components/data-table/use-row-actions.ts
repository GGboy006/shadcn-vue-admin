import { EyeIcon, PencilIcon, Trash2Icon } from '@lucide/vue'
import { computed } from 'vue'

import type { RowActionItem } from './types'

/** 标准"查看/编辑/删除"三件套的 items + 统一分发。非三件套场景直接手写 items 数组。 */
export function useRowActions(handlers: {
  view?: () => void
  edit?: () => void
  delete?: () => void
}) {
  const items = computed<RowActionItem[]>(() => {
    return [
      handlers.view && { key: 'view', label: '查看', icon: EyeIcon },
      handlers.edit && { key: 'edit', label: '编辑', icon: PencilIcon },
      handlers.delete && { key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' as const },
    ].filter(Boolean) as RowActionItem[]
  })

  function handleAction(key: string) {
    handlers[key as 'view' | 'edit' | 'delete']?.()
  }

  return { items, handleAction }
}
