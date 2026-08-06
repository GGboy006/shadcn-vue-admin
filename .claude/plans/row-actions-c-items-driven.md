# C 方案:DataTableRowActions 改为 items 数据驱动 + extra 兜底

## 背景与根因

当前组件把操作硬编码为 `showView/showEdit/showDelete` + `viewText/editText/deleteText` + 一个 `#extra-items` slot。`#extra-items` 里塞的是 `<UiDropdownMenuItem>`,只在 dropdown 模式下成立;**buttons 模式没有 dropdown 容器,会报错**。所以 committees/merchants/tasks 三个带自定义项的页面被锁死在 dropdown,切不了模式。

C 方案:操作项用**数据数组描述**,组件按 mode 循环渲染成对应标签;表达不了的结构(子菜单)用 extra slot 兜底。

## 新 API

### Props

```ts
interface RowActionItem {
  /** 唯一标识,回传给 @action */
  key: string
  label: string
  /** 图标组件,lucide icon */
  icon?: Component
  /** default | destructive(红色) */
  variant?: 'default' | 'destructive'
  /** 禁用 */
  disabled?: boolean
}

interface DataTableRowActionsProps {
  mode?: 'dropdown' | 'buttons'        // 默认 dropdown
  items: RowActionItem[]               // 操作项数组(替代 showView/showEdit/showDelete)
  /** dropdown 菜单宽度 */
  contentWidth?: string
  /** destructive 项前是否自动加分隔符,默认 true */
  autoSeparator?: boolean
}
```

### Emits

```ts
emit('action', key: string)   // 统一出口,调用方按 key 分发
```

废弃旧的三件套 emits(`@view/@edit/@delete`)和 `viewText/editText/deleteText`/`showView/showEdit/showDelete` props。

### Slots

- `#extra` -- 保留,用于 dropdown 模式下的特殊结构(子菜单)。**buttons 模式不渲染此 slot**(子菜单按钮组表达不了,调用方若在 buttons 模式传 extra,组件忽略并 console.warn)。

## 组件内部渲染逻辑

```vue
<!-- dropdown 模式 -->
<UiDropdownMenu v-else-if="props.mode === 'dropdown'">
  <UiDropdownMenuTrigger as-child>...</UiDropdownMenuTrigger>
  <UiDropdownMenuContent align="end" :class="props.contentWidth">
    <template v-for="item in props.items" :key="item.key">
      <!-- destructive 项前自动加分隔符 -->
      <UiDropdownMenuSeparator v-if="props.autoSeparator && item.variant === 'destructive'" />
      <UiDropdownMenuItem
        :variant="item.variant"
        :disabled="item.disabled"
        @click.stop="emit('action', item.key)"
      >
        <component :is="item.icon" v-if="item.icon" class="mr-2 size-4" />
        {{ item.label }}
        <UiDropdownMenuShortcut v-if="item.variant === 'destructive'">⌘⌫</UiDropdownMenuShortcut>
      </UiDropdownMenuItem>
    </template>
    <slot name="extra" />   <!-- tasks 的子菜单塞这里 -->
  </UiDropdownMenuContent>
</UiDropdownMenu>

<!-- buttons 模式 -->
<div v-if="props.mode === 'buttons'" class="flex items-center justify-end gap-1">
  <template v-for="item in props.items" :key="item.key">
    <UiButton
      variant="ghost" size="icon" class="size-8"
      :class="item.variant === 'destructive' ? 'text-destructive hover:text-destructive' : ''"
      :disabled="item.disabled"
      :title="item.label"
      @click="emit('action', item.key)"
    >
      <component :is="item.icon" v-if="item.icon" class="size-4" />
      <span class="sr-only">{{ item.label }}</span>
    </UiButton>
  </template>
</div>
```

## 调用方迁移(19 个文件)

### 纯 dropdown 三件套(13 个)
原:
```vue
<DataTableRowActions @view="openDetail" @edit="openEdit" @delete="openDelete" />
```
新:
```vue
<script setup>
import { EyeIcon, PencilIcon, Trash2Icon } from '@lucide/vue'
const items = [
  { key: 'view',   label: '查看', icon: EyeIcon },
  { key: 'edit',   label: '编辑', icon: PencilIcon },
  { key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' },
]
function handleAction(key) {
  if (key === 'view') openDetail()
  else if (key === 'edit') openEdit()
  else if (key === 'delete') openDelete()
}
</script>
<template>
  <DataTableRowActions :items="items" @action="handleAction" />
  ...
</template>
```

13 个:neighborhood/{activity,banner,dynamic,notice,service,unified,special-article,special}、
special(无查看,items 去掉 view)、merchant-business/{category,faq}(无查看)、goods/activity(有查看详情)。

**优化**:为消除"items + handleAction switch"这层样板,抽一个 `useRowActions` 工厂返回 items 和按 key 分发的 handler:
```ts
// use-row-actions.ts
export function useRowActions(handlers: { view?: Fn; edit?: Fn; delete?: Fn }) {
  const items = computed(() => [
    handlers.view   && { key: 'view',   label: '查看', icon: EyeIcon },
    handlers.edit   && { key: 'edit',   label: '编辑', icon: PencilIcon },
    handlers.delete && { key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' },
  ].filter(Boolean))
  function handleAction(key) {
    handlers[key]?.()
  }
  return { items, handleAction }
}
```
调用方:
```ts
const { items, handleAction } = useRowActions({
  view: openDetail, edit: openEdit, delete: openDelete,
})
```
**注意**:这套 `useRowActions` 只解决"标准三件套"。非三件套页面(merchants/tasks/community)直接自己定义 items 数组,不用 hook。

### dropdown + 自定义项(2 个:committees/merchants)
items 里加自定义项:
```ts
// merchants
const items = [
  { key: 'edit',   label: '编辑',         icon: PencilIcon },
  { key: 'assign', label: '分配AI工具',   icon: BotIcon },
  { key: 'enter',  label: '进入商户后台', icon: StoreIcon },
  { key: 'delete', label: '删除',         icon: Trash2Icon, variant: 'destructive' },
]
function handleAction(key) {
  if (key === 'edit') handleSelect('edit')
  else if (key === 'assign') handleAssign()
  else if (key === 'enter') handleEnterBusiness()
  else if (key === 'delete') handleSelect('delete')
}
```
**好处**:assign/enter 现在是数据项,切 buttons 模式也能渲染成按钮(之前 slot 里塞 UiDropdownMenuItem 会报错)。只有 tasks 因子菜单仍需 extra slot。

### buttons 模式(2 个:conversations/leave-message)
```ts
const items = [
  { key: 'view', label: '查看详情', icon: EyeIcon },
]
function handleAction(key) { if (key === 'view') handleViewDetail() }
```
```vue
<DataTableRowActions mode="buttons" :items="items" @action="handleAction" />
```

### tasks(子菜单,dropdown only)
```ts
const items = [
  { key: 'edit',   label: '编辑', icon: PencilIcon },
  { key: 'copy',   label: '复制', disabled: true },
  { key: 'star',   label: '收藏', disabled: true },
  { key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' },
]
function handleAction(key) {
  if (key === 'edit') handleSelect('edit')
  else if (key === 'delete') handleSelect('delete')
}
```
```vue
<DataTableRowActions :items="items" @action="handleAction">
  <template #extra>
    <UiDropdownMenuSeparator />
    <UiDropdownMenuSub>
      <UiDropdownMenuSubTrigger>标签</UiDropdownMenuSubTrigger>
      <UiDropdownMenuSubContent>
        <UiDropdownMenuRadioGroup v-model="taskLabel">...</UiDropdownMenuRadioGroup>
      </UiDropdownMenuSubContent>
    </UiDropdownMenuSub>
  </template>
</DataTableRowActions>
```
tasks 切 buttons 会丢子菜单 -- 这是预期(tasks 永远 dropdown),加 `console.warn` 提醒。

## 执行步骤

1. 重写 `row-actions.vue`(items 驱动 + extra slot)
2. 重写 `use-row-actions.ts`(handlers 工厂)
3. 迁移 19 个调用方:
   - 13 个纯三件套 -> useRowActions hook
   - 2 个 dropdown+自定义项(merchants/committees) -> 手写 items
   - 2 个 buttons(conversations/leave-message) -> 手写 items
   - 1 个 tasks -> items + extra slot
   - 1 个 community/announcement + community/news -> items(view 走独立 sheet)
4. `pnpm exec vue-tsc -b` 类型检查
5. `pnpm exec eslint --fix`
6. 抽查验证:notice(三件套)、merchants(自定义项+Modal)、tasks(子菜单)、conversations(buttons 跳路由)
7. 提交

## 风险与权衡

- **API 破坏性**:不保留旧 props,19 文件全迁。但组件才一个 commit 历史,无外部消费者,一刀切最干净。
- **useRowActions hook 的边界**:只覆盖标准三件套(95% 页面)。非三件套直接写 items,不硬塞进 hook,避免 hook 膨胀。
- **autoSeparator 默认 true**:destructive 项前自动加 separator,与现状一致(notice 原本 delete 前有 separator)。
- **buttons 模式不渲染 extra slot**:子菜单 buttons 表达不了,tasks 锁 dropdown。若调用方误传,console.warn。
- **disabled 项**:tasks 的"复制/收藏"原是 disabled,items 里带 `disabled: true` 即可,buttons 模式下渲染成 disabled 按钮。

## 改造收益

- 解决根因:自定义项不再锁死 dropdown 模式(除 tasks 子菜单外)
- 组件代码更简单:循环 vs v-if 堆叠
- 操作可扩展:加"审核/上架/导出"只需 items 加一项,不碰组件
- 19 文件迁移后,API 统一且向后无包袱
