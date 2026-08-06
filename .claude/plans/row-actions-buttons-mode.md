# 扩展 DataTableRowActions:按钮组模式 + 纳入剩余 3 文件

## 目标

给 `DataTableRowActions` 增加 `mode="buttons"` 按钮组模式,与现有 `mode="dropdown"`(默认)并列。然后把剩余 3 个未纳入的文件也吃进来:
- `conversations`(单按钮跳路由 -> 按钮组模式)
- `neighborhood/leave-message`(单按钮开弹窗 -> 按钮组模式)
- `tasks`(子菜单+disabled -> dropdown 模式 + #extra-items slot)

## 组件扩展:`row-actions.vue`

新增 prop:
```ts
mode?: 'dropdown' | 'buttons'   // 默认 'dropdown'
```

### 按钮组模式渲染
```vue
<div v-if="props.mode === 'buttons'" class="flex items-center justify-end gap-1">
  <UiButton v-if="props.showView"   variant="ghost" size="icon" class="size-8" :title="props.viewText"   @click="emit('view')">
    <EyeIcon class="size-4" /><span class="sr-only">{{ props.viewText }}</span>
  </UiButton>
  <UiButton v-if="props.showEdit"   variant="ghost" size="icon" class="size-8" :title="props.editText"   @click="emit('edit')">
    <PencilIcon class="size-4" /><span class="sr-only">{{ props.editText }}</span>
  </UiButton>
  <UiButton v-if="props.showDelete" variant="ghost" size="icon" class="size-8 text-destructive hover:text-destructive" :title="props.deleteText" @click="emit('delete')">
    <Trash2Icon class="size-4" /><span class="sr-only">{{ props.deleteText }}</span>
  </UiButton>
  <slot name="extra-items" />
</div>
```

- icon 按钮(`size-8` + `size-4` 图标),与 `leave-message` 现状一致
- `title` 属性提供原生 tooltip(无障碍 + 悬停提示)
- `sr-only` span 供屏幕阅读器
- 删除按钮带 `text-destructive`
- `#extra-items` slot 保留(按钮组模式下放 `<UiButton>`,dropdown 模式下放 `<UiDropdownMenuItem>`)

### dropdown 模式(不变)
现有逻辑保持。

### 新增图标 import
`Trash2Icon`(删除按钮用)。

## 纳入文件

### 1. `conversations/components/data-table-row-actions.vue`(按钮组模式)

原:文字按钮"查看详情" -> 路由跳转
```vue
<Button variant="ghost" size="sm" @click="handleViewDetail">查看详情</Button>
```
改为:
```vue
<script setup lang="ts">
import type { IConversation } from '@/services/api/conversation.api'
import { DataTableRowActions } from '@/components/data-table'
import { getConversationDetailRoute } from '../utils/navigation'

const props = defineProps<{ row: IConversation }>()
const router = useRouter()
function handleViewDetail() {
  router.push(getConversationDetailRoute(props.row))
}
</script>
<template>
  <DataTableRowActions
    mode="buttons"
    :show-edit="false"
    :show-delete="false"
    view-text="查看详情"
    @view="handleViewDetail"
  />
</template>
```
**视觉变化**:文字按钮 -> eye icon 按钮 + title="查看详情"。更紧凑,与表格操作列图标化惯例一致。

### 2. `neighborhood/leave-message/components/data-table-row-actions.vue`(按钮组模式)

原:eye icon 按钮 + Dialog。改为:
```vue
<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import { DataTableRowActions, useRowActions } from '@/components/data-table'
import type { INeighborhoodLeaveMessage } from '@/services/api/neighborhood-leave-message.api'
import LeaveMessageDetailDialog from './leave-message-detail-dialog.vue'

const props = defineProps<{ row: Row<INeighborhoodLeaveMessage> }>()
const message = computed(() => props.row.original)
const { isDetailOpen, openDetail } = useRowActions()
</script>
<template>
  <DataTableRowActions
    mode="buttons"
    :show-edit="false"
    :show-delete="false"
    view-text="查看详情"
    @view="openDetail"
  />
  <LeaveMessageDetailDialog v-model:open="isDetailOpen" :message="message" />
</template>
```
**视觉零变化**:原本就是 eye icon 按钮 + title,完全一致。

### 3. `tasks/components/data-table-row-actions.vue`(dropdown 模式 + slot)

原菜单:编辑 / 复制(disabled) / 收藏(disabled) / 标签(子菜单) / 删除。
编辑/删除走标准件,中间三项进 `#extra-items`:
```vue
<DataTableRowActions
  @edit="handleSelect('edit')"
  @delete="handleSelect('delete')"
>
  <template #extra-items>
    <UiDropdownMenuItem disabled>复制</UiDropdownMenuItem>
    <UiDropdownMenuItem disabled>收藏</UiDropdownMenuItem>
    <UiDropdownMenuSeparator />
    <UiDropdownMenuSub>
      <UiDropdownMenuSubTrigger>标签</UiDropdownMenuSubTrigger>
      <UiDropdownMenuSubContent>
        <UiDropdownMenuRadioGroup v-model="taskLabel">
          <UiDropdownMenuRadioItem v-for="label in labels" :key="label.value" :value="label.value">
            {{ label.label }}
          </UiDropdownMenuRadioItem>
        </UiDropdownMenuRadioGroup>
      </UiDropdownMenuSubContent>
    </UiDropdownMenuSub>
  </template>
</DataTableRowActions>
```
保留:`Modal` 外壳、`handleSelect`、`componentLoader`、`showComponent`、`taskLabel` ref、`labels` import。

**样式变化(需确认接受)**:
- 编辑项:原"编辑" + 右侧 `FilePenLineIcon`(shortcut 位)-> 左侧 `PencilIcon` + "编辑"
- 删除项:原"删除" + 右侧 `Trash2Icon`(shortcut 位)-> "删除" + `⌘⌫` 快捷键
- 复制/收藏(disabled)+ 标签子菜单:位置从"编辑后、删除前"不变,但中间多一个 separator(因为标准件在 extra 后、delete 前有 separator,tasks 原来在 extra 内部也有 separator,可能视觉上多一道线)

## 执行步骤

1. 扩展 `row-actions.vue`:加 `mode` prop + 按钮组分支 + `Trash2Icon` import
2. 改造 conversations(按钮组)
3. 改造 leave-message(按钮组)
4. 改造 tasks(dropdown + slot)
5. `pnpm exec vue-tsc -b` 类型检查
6. `pnpm exec eslint --fix` 修排序
7. 手动验证:conversations 点查看跳路由、leave-message 点查看开弹窗、tasks 编辑/删除/标签子菜单/disabled 项
8. 提交

## 风险与注意

- **conversations 文字->icon**:唯一明显视觉变化,需用户接受。
- **tasks 样式微调**:编辑/删除图标位置变化 + 可能多一道 separator。tasks 是 shadcn 官方 demo 页,改动它需要接受这点。
- 组件复杂度:双模式 + slot,但 props/emits 接口不变,向后兼容(默认 dropdown)。
- 按钮组模式的 `#extra-items` 暂无调用方(tasks 用的是 dropdown 模式的 slot),保留以备扩展。

## 改造收益

- 3 个文件纳入,消除最后的重复
- 组件成为"操作列唯一入口",dropdown / 按钮组两种形态统一管理
- 全项目 19 个 row-actions 文件全部复用同一组件(之前 16 个)
