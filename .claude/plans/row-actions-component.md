# 抽取全局 DataTableRowActions 通用组件

## 背景

当前 9 个 `data-table-row-actions.vue` 文件各自复制粘贴了同一套 dropdown 模板(触发器按钮 + 菜单项 + 分隔符 + 删除样式 + 3 个 open ref + 3 个 handler),只有弹窗组件和实体类型不同。抽取一个公共组件 + 配套 composable,消除模板与状态样板,只保留各页特有的弹窗挂载。

## 改造范围

### 纳入(9 个 dropdown 场景)
- `src/pages/neighborhood/{activity,banner,dynamic,notice,service,unified,special-article,special}/components/data-table-row-actions.vue`(8 个)
- `src/pages/committees/components/data-table-row-actions.vue`(1 个,带自定义项"进入居委会后台")

### 不纳入(保持独立,理由如下)
- `neighborhood/leave-message`:只有"查看"且**无 dropdown**,直接是 eye 图标按钮,42 行已极简,套公共组件反而多一层。
- `tasks/components/data-table-row-actions.vue`:唯一使用 `UiDropdownMenuSub` 子菜单(RadioGroup 选标签)+ 动态组件加载,结构特殊。

## 新增文件

### 1. `src/components/data-table/row-actions.vue`(公共组件)

**Props**
| 名称 | 类型 | �值 | 说明 |
|---|---|---|---|
| `showView` | `boolean` | `true` | 显示"查看"项 |
| `showEdit` | `boolean` | `true` | 显示"编辑"项 |
| `showDelete` | `boolean` | `true` | 显示"删除"项(destructive 样式) |
| `viewText` | `string` | `'查看'` | 覆盖文案 |
| `editText` | `string` | `'编辑'` | |
| `deleteText` | `string` | `'删除'` | |
| `contentWidth` | `string` | `'w-[160px]'` | 菜单宽度 |

**Emits**:`view` / `edit` / `delete`

**Slots**:`#extra-items` —— 自定义菜单项,渲染在"编辑"之后、"删除"之前( committees 的"进入居委会后台"用此插槽)。

**菜单结构(分隔符逻辑)**
```
[查看]          showView
[编辑]          showEdit
[#extra-items]  slot(无前导分隔)
─────────       separator —— 仅当 showDelete 且 (showView || showEdit || extra 有内容) 时渲染
[删除]          showDelete, destructive 样式 + ⌘⌫ 快捷键
```

> 当三项全在(notice)= 查看 / 编辑 / separator / 删除 ✓
> 无查看(special)= 编辑 / separator / 删除 ✓
> 带 extra(committees)= 编辑 / 进入后台 / separator / 删除 ✓

**触发器**:`UiButton` ghost + `EllipsisIcon`,沿用现状样式 `flex h-8 w-8 p-0 data-[state=open]:bg-muted`。

### 2. `src/components/data-table/use-row-actions.ts`(composable)

```ts
export function useRowActions() {
  const isDetailOpen = ref(false)
  const isEditOpen = ref(false)
  const isDeleteOpen = ref(false)
  return {
    isDetailOpen, isEditOpen, isDeleteOpen,
    openDetail: () => { isDetailOpen.value = true },
    openEdit: () => { isEditOpen.value = true },
    openDelete: () => { isDeleteOpen.value = true },
  }
}
```

### 3. `src/components/data-table/index.ts`(追加导出)
```ts
export { default as DataTableRowActions } from './row-actions.vue'
export { useRowActions } from './use-row-actions'
```

## 调用方前后对比(以 notice 为例)

### 改造前(88 行)
```vue
<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import { EllipsisIcon, EyeIcon, PencilIcon } from '@lucide/vue'
import type { INeighborhoodNotice } from '...'
import NoticeDeleteDialog from './notice-delete-dialog.vue'
import NoticeDetailDialog from './notice-detail-dialog.vue'
import NoticeFormSheet from './notice-form-sheet.vue'

interface DataTableRowActionsProps { row: Row<INeighborhoodNotice> }
const props = defineProps<DataTableRowActionsProps>()
const notice = computed(() => props.row.original)
const isDetailOpen = ref(false)
const isEditOpen = ref(false)
const isDeleteOpen = ref(false)
const detailUniqueCode = computed(() => notice.value?.uniqueCode)
function handleView() { isDetailOpen.value = true }
function handleEdit() { isEditOpen.value = true }
function handleDelete() { isDeleteOpen.value = true }
</script>
<template>
  <UiDropdownMenu> ... 50 行 dropdown 模板 ... </UiDropdownMenu>
  <NoticeDetailDialog v-model:open="isDetailOpen" :unique-code="detailUniqueCode" />
  <NoticeFormSheet v-model:open="isEditOpen" :notice="notice" />
  <NoticeDeleteDialog v-model:open="isDeleteOpen" :notice="notice" />
</template>
```

### 改造后(约 18 行)
```vue
<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import { DataTableRowActions, useRowActions } from '@/components/data-table'
import type { INeighborhoodNotice } from '@/services/api/neighborhood-notice.api'
import NoticeDeleteDialog from './notice-delete-dialog.vue'
import NoticeDetailDialog from './notice-detail-dialog.vue'
import NoticeFormSheet from './notice-form-sheet.vue'

const props = defineProps<{ row: Row<INeighborhoodNotice> }>()
const notice = computed(() => props.row.original)
const { isDetailOpen, isEditOpen, isDeleteOpen, openDetail, openEdit, openDelete } = useRowActions()
</script>
<template>
  <DataTableRowActions @view="openDetail" @edit="openEdit" @delete="openDelete" />
  <NoticeDetailDialog v-model:open="isDetailOpen" :unique-code="notice?.uniqueCode" />
  <NoticeFormSheet v-model:open="isEditOpen" :notice="notice" />
  <NoticeDeleteDialog v-model:open="isDeleteOpen" :notice="notice" />
</template>
```

### special(无查看)
```vue
<DataTableRowActions :show-view="false" @edit="openEdit" @delete="openDelete" />
```

### committees(自定义项)
```vue
<DataTableRowActions :show-view="false" @edit="openEdit" @delete="openDelete">
  <template #extra-items>
    <UiDropdownMenuItem @click.stop="handleEnterBusiness">
      <StoreIcon class="mr-2 size-4" /> 进入居委会后台
    </UiDropdownMenuItem>
  </template>
</DataTableRowActions>
```

## 执行步骤

1. 新建 `row-actions.vue` + `use-row-actions.ts`,更新 `index.ts` 导出
2. 改造 8 个居委会 dropdown 页面(逐个替换,保留各自弹窗与实体类型)
3. 改造 committees(带 `#extra-items` + `:show-view="false"`)
4. `pnpm tsc --noEmit` 类型检查
5. `pnpm dev` 手动抽查 notice / special / committees 三个代表性页面,确认 dropdown、三项操作、弹窗开关、删除快捷键均正常
6. 提交

## 风险与注意

- 公共组件内 `<UiDropdownMenuItem @click.stop>` 仍用 `.stop`,避免点击冒泡触发行选中。
- `useRowActions` 返回的 ref 在模板里直接用于 `v-model:open`,保持弹窗受控语义不变。
- committees 的删除弹窗是复用 `Modal + MerchantDelete`(非居委会三件套),改造时**删除项改用 `@delete="openDelete"` + 原有 Modal 结构**,不强行套 AlertDialog。
- 行为零变化:菜单文案、图标、destructive 样式、⌘⌫ 快捷键、分隔符位置均与现状一致。
