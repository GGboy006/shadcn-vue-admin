<script setup lang="ts">
import { EllipsisIcon } from '@lucide/vue'

import type { RowActionItem } from './types'

interface DataTableRowActionsProps {
  /** 操作列形态:dropdown 下拉菜单(默认) | buttons 图标按钮组 */
  mode?: 'dropdown' | 'buttons'
  /** 操作项数组 */
  items: RowActionItem[]
  /** dropdown 模式菜单宽度 */
  contentWidth?: string
  /** destructive 项前自动加分隔符,默认 true */
  autoSeparator?: boolean
}

const props = withDefaults(defineProps<DataTableRowActionsProps>(), {
  mode: 'dropdown',
  contentWidth: 'w-[160px]',
  autoSeparator: true,
})

const emit = defineEmits<{
  action: [key: string]
}>()

// buttons 模式不支持 extra slot(子菜单等结构表达不了);dropdown 模式才渲染
const hasExtraSlot = computed(() => !!useSlots().extra)
watchEffect(() => {
  if (props.mode === 'buttons' && hasExtraSlot.value) {
    console.warn('[DataTableRowActions] buttons 模式不渲染 #extra slot,子菜单等结构仅 dropdown 模式支持')
  }
})
</script>

<template>
  <!-- 按钮组模式:平铺的图标按钮 -->
  <div
    v-if="props.mode === 'buttons'"
    class="flex items-center justify-end gap-1"
  >
    <UiButton
      v-for="item in props.items"
      :key="item.key"
      variant="ghost"
      size="icon"
      class="size-8"
      :class="item.variant === 'destructive' ? 'text-destructive hover:text-destructive' : ''"
      :disabled="item.disabled"
      :title="item.label"
      @click="emit('action', item.key)"
    >
      <component :is="item.icon" v-if="item.icon" class="size-4" />
      <span class="sr-only">{{ item.label }}</span>
    </UiButton>
  </div>

  <!-- dropdown 模式:省略号下拉菜单 -->
  <UiDropdownMenu v-else>
    <UiDropdownMenuTrigger as-child>
      <UiButton
        variant="ghost"
        class="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
      >
        <EllipsisIcon class="size-4" />
        <span class="sr-only">Open menu</span>
      </UiButton>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end" :class="props.contentWidth">
      <template v-for="item in props.items" :key="item.key">
        <UiDropdownMenuSeparator
          v-if="props.autoSeparator && item.variant === 'destructive'"
        />
        <UiDropdownMenuItem
          :variant="item.variant"
          :disabled="item.disabled"
          @click.stop="emit('action', item.key)"
        >
          <component :is="item.icon" v-if="item.icon" class="mr-2 size-4" />
          {{ item.label }}
          <UiDropdownMenuShortcut v-if="item.variant === 'destructive'">
            ⌘⌫
          </UiDropdownMenuShortcut>
        </UiDropdownMenuItem>
      </template>

      <!-- 特殊结构(子菜单等)兜底,仅 dropdown 模式 -->
      <slot name="extra" />
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
