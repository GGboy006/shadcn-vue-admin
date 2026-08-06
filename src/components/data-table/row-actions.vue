<script setup lang="ts">
import { EllipsisIcon, EyeIcon, PencilIcon, Trash2Icon } from '@lucide/vue'

interface DataTableRowActionsProps {
  /** 操作列形态:dropdown 下拉菜单(默认) | buttons 图标按钮组 */
  mode?: 'dropdown' | 'buttons'
  showView?: boolean
  showEdit?: boolean
  showDelete?: boolean
  viewText?: string
  editText?: string
  deleteText?: string
  /** dropdown 模式下的菜单宽度 */
  contentWidth?: string
}

const props = withDefaults(defineProps<DataTableRowActionsProps>(), {
  mode: 'dropdown',
  showView: true,
  showEdit: true,
  showDelete: true,
  viewText: '查看',
  editText: '编辑',
  deleteText: '删除',
  contentWidth: 'w-[160px]',
})

const emit = defineEmits<{
  view: []
  edit: []
  delete: []
}>()
</script>

<template>
  <!-- 按钮组模式:平铺的图标按钮 -->
  <div
    v-if="props.mode === 'buttons'"
    class="flex items-center justify-end gap-1"
  >
    <UiButton
      v-if="props.showView"
      variant="ghost"
      size="icon"
      class="size-8"
      :title="props.viewText"
      @click="emit('view')"
    >
      <EyeIcon class="size-4" />
      <span class="sr-only">{{ props.viewText }}</span>
    </UiButton>
    <UiButton
      v-if="props.showEdit"
      variant="ghost"
      size="icon"
      class="size-8"
      :title="props.editText"
      @click="emit('edit')"
    >
      <PencilIcon class="size-4" />
      <span class="sr-only">{{ props.editText }}</span>
    </UiButton>
    <UiButton
      v-if="props.showDelete"
      variant="ghost"
      size="icon"
      class="size-8 text-destructive hover:text-destructive"
      :title="props.deleteText"
      @click="emit('delete')"
    >
      <Trash2Icon class="size-4" />
      <span class="sr-only">{{ props.deleteText }}</span>
    </UiButton>
    <slot name="extra-items" />
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
      <UiDropdownMenuItem v-if="props.showView" @click.stop="emit('view')">
        <EyeIcon class="mr-2 size-4" />
        {{ props.viewText }}
      </UiDropdownMenuItem>

      <UiDropdownMenuItem v-if="props.showEdit" @click.stop="emit('edit')">
        <PencilIcon class="mr-2 size-4" />
        {{ props.editText }}
      </UiDropdownMenuItem>

      <slot name="extra-items" />

      <UiDropdownMenuSeparator v-if="props.showDelete" />

      <UiDropdownMenuItem
        v-if="props.showDelete"
        class="text-destructive focus:text-destructive"
        @click.stop="emit('delete')"
      >
        {{ props.deleteText }}
        <UiDropdownMenuShortcut>⌘⌫</UiDropdownMenuShortcut>
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
