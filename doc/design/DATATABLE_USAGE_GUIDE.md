# DataTable 全局组件使用指南

> 目标：统一使用项目已有的 `src/components/data-table` 组件，替代 `src/pages/conversations/index.vue` 里手写的 `<Table>` + 分页。
>
> 本文档基于 `merchants`（服务端分页）和 `tasks`（本地数据）两个页面的实现整理。

---

## 一、组件结构

全局 DataTable 由以下几层组成：

```
src/components/data-table/
├── data-table.vue          # 表格 + 空状态 + 分页容器
├── table-pagination.vue    # 分页组件（已做移动端适配）
├── use-generate-vue-table.ts # 封装 useVueTable，自动识别服务端/客户端分页
├── types.ts                # DataTableProps / ServerPagination 类型
├── table-columns.ts        # SelectColumn / RadioSelectColumn
├── column-header.vue       # 可排序/可固定的表头
├── table-loading.vue       # 加载遮罩
├── view-options.vue        # 列显示/隐藏下拉
├── faceted-filter.vue      # 多选筛选标签
└── bulk-actions.vue        # 批量操作栏
```

---

## 二、两种使用模式

### 模式 A：服务端分页（推荐用于会话列表）

参考页面：`src/pages/merchants/index.vue`

适用于：数据量大、后端分页、需要筛选/排序。

#### 1. 页面级调用

```vue
<script setup lang="ts">
import { BasicPage } from '@/components/global-layout'
import { useGetMerchantListQuery } from '@/services/api/merchant.api'

import { columns } from './components/columns'
import DataTable from './components/data-table.vue'
import DataTableToolbar from './components/data-table-toolbar.vue'

const query = ref<IMerchantListQuery>({
  pageNum: 1,
  pageSize: 10,
})

const { data, isLoading } = useGetMerchantListQuery(query)

const list = computed(() => data.value?.data?.list ?? [])
const total = computed(() => data.value?.data?.total ?? 0)

// 关键：把服务端分页信息传给 DataTable
const serverPagination = computed(() => ({
  page: query.value.pageNum,
  pageSize: query.value.pageSize,
  total: total.value,
  onPageChange: (page: number) => {
    query.value.pageNum = page
  },
  onPageSizeChange: (pageSize: number) => {
    query.value.pageSize = pageSize
    query.value.pageNum = 1
  },
}))
</script>

<template>
  <BasicPage title="商户/物业管理" description="..." sticky>
    <div class="overflow-x-auto">
      <DataTable
        :loading="isLoading"
        :data="list"
        :columns="columns"
        :server-pagination="serverPagination"
      >
        <template #toolbar="{ table }">
          <DataTableToolbar :table="table" />
        </template>
      </DataTable>
    </div>
  </BasicPage>
</template>
```

#### 2. 页面内 DataTable 包装层

`src/pages/merchants/components/data-table.vue`

```vue
<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'
import { DataTable, useGenerateVueTable } from '@/components/data-table'

import type { Merchant } from '../data/schema'

import DataTableToolbar from './data-table-toolbar.vue'

const props = defineProps<DataTableProps<Merchant>>()

const table = useGenerateVueTable<Merchant>(props, {
  initialColumnVisibility: {
    merchantCode: false,
    businessStatus: false,
    address: false,
  },
})
</script>

<template>
  <DataTable :columns :data :loading :table :server-pagination="serverPagination">
    <template #toolbar>
      <slot name="toolbar" :table="table">
        <DataTableToolbar :table class="w-full overflow-x-auto" />
      </slot>
    </template>
  </DataTable>
</template>
```

> 为什么要多包一层？
> - `useGenerateVueTable` 需要 `props` 拿到 `data` / `columns` / `serverPagination`
> - 可以把 `columns` 定义拆到单独文件
> - 可以在包装层配置 `initialColumnVisibility`、批量操作、行操作等

#### 3. 列定义

`src/pages/merchants/components/columns.ts`

```ts
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'

import { DataTableColumnHeader, SelectColumn } from '@/components/data-table'
import Badge from '@/components/ui/badge/Badge.vue'

import type { Merchant } from '../data/schema'

export const columns: ColumnDef<Merchant>[] = [
  SelectColumn as ColumnDef<Merchant>,
  {
    accessorKey: 'merchantName',
    header: ({ column }) => h(DataTableColumnHeader<Merchant>, { column, title: '名称' }),
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.getValue('merchantName')),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  },
  // ... 更多列
  {
    id: 'actions',
    cell: ({ row }) => h(DataTableRowActions, { row }),
    enableHiding: false,
  },
]
```

#### 4. Toolbar 筛选

`src/pages/merchants/components/data-table-toolbar.vue`

```vue
<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'
import { DataTableViewOptions } from '@/components/data-table'

interface DataTableToolbarProps {
  table: Table<Merchant>
}
defineProps<DataTableToolbarProps>()
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center flex-1 space-x-2">
      <Input placeholder="按名称筛选..." />
      <Select>
        <!-- 状态筛选 -->
      </Select>
    </div>
    <DataTableViewOptions :table="table" />
  </div>
</template>
```

---

### 模式 B：本地数据 + 客户端分页

参考页面：`src/pages/tasks/index.vue`

适用于：数据量小、一次性返回、不需要服务端分页。

```vue
<script setup lang="ts">
import { BasicPage } from '@/components/global-layout'

import { columns } from './components/columns'
import DataTable from './components/data-table.vue'
import tasks from './data/tasks.json'
</script>

<template>
  <BasicPage title="任务管理" description="..." sticky>
    <div class="overflow-x-auto">
      <DataTable :data="tasks" :columns="columns" />
    </div>
  </BasicPage>
</template>
```

对应的 `components/data-table.vue`：

```vue
<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'
import { DataTable, useGenerateVueTable } from '@/components/data-table'

import type { Task } from '../data/schema'

const props = defineProps<DataTableProps<Task>>()
const table = useGenerateVueTable<Task>(props)
</script>

<template>
  <DataTable :columns :table :data :loading>
    <template #toolbar>
      <DataTableToolbar :table="table" class="w-full overflow-x-auto" />
    </template>
  </DataTable>
</template>
```

---

## 三、服务端分页的工作原理

`use-generate-vue-table.ts` 会根据是否传入 `serverPagination` 自动切换模式：

| 模式 | 标识 | pageIndex | pageSize | pageCount |
|------|------|-----------|----------|-----------|
| 服务端 | `!!props.serverPagination` | `serverPagination.page - 1` | `serverPagination.pageSize` | `total / pageSize` |
| 客户端 | 无 | 内部 state | 内部 state | 根据 data 自动计算 |

关键配置：

```ts
if (useServerPagination) {
  tableConfig.pageCount = pageCount.value
  tableConfig.manualPagination = true
}
else {
  tableConfig.getPaginationRowModel = getPaginationRowModel()
}
```

---

## 四、会话列表改造建议

### 目标

把 `src/pages/conversations/index.vue` 从手写 `<Table>` 改成 `DataTable`，复用全局分页组件。

### 建议文件结构

```
src/pages/conversations/
├── index.vue
├── components/
│   ├── columns.ts          # 列定义
│   ├── data-table.vue      # DataTable 包装层
│   └── data-table-toolbar.vue # 筛选工具栏
└── data/
    └── schema.ts           # IConversation 类型别名（可选）
```

### 参考实现

#### 1. `components/columns.ts`

```ts
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'

import { DataTableColumnHeader } from '@/components/data-table'
import { Badge, Button } from '@/components/ui'

import { serviceModeConfig, userTagConfig } from '@/services/api/conversation.api'
import type { IConversation } from '@/services/api/conversation.api'

export const columns: ColumnDef<IConversation>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => h(DataTableColumnHeader<IConversation>, { column, title: '会话标题' }),
    meta: { title: '会话标题' },
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.getValue('title') || '未命名会话'),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'userTag',
    header: ({ column }) => h(DataTableColumnHeader<IConversation>, { column, title: '用户标签' }),
    meta: { title: '用户标签' },
    cell: ({ row }) => {
      const tag = row.getValue('userTag') as number
      return h(Badge, { variant: 'outline' }, () => userTagConfig[tag] || '未知')
    },
    enableSorting: false,
  },
  {
    accessorKey: 'serviceMode',
    header: ({ column }) => h(DataTableColumnHeader<IConversation>, { column, title: '服务模式' }),
    meta: { title: '服务模式' },
    cell: ({ row }) => {
      const mode = row.getValue('serviceMode') as number
      const config = serviceModeConfig[mode]
      return h(Badge, { variant: config?.variant || 'default' }, () => config?.label || '未知')
    },
    enableSorting: false,
  },
  {
    accessorKey: 'lastMessagePreview',
    header: ({ column }) => h(DataTableColumnHeader<IConversation>, { column, title: '最后消息' }),
    meta: { title: '最后消息' },
    cell: ({ row }) => h('div', { class: 'max-w-[200px] truncate text-sm text-muted-foreground' }, row.getValue('lastMessagePreview') || '-'),
    enableSorting: false,
  },
  {
    accessorKey: 'lastMessageTime',
    header: ({ column }) => h(DataTableColumnHeader<IConversation>, { column, title: '最后消息时间' }),
    meta: { title: '最后消息时间' },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground' }, formatDate(row.getValue('lastMessageTime'))),
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: ({ row }) => h(Button, { variant: 'ghost', size: 'sm', onClick: () => handleViewDetail(row.original) }, () => '查看详情'),
    enableHiding: false,
  },
]
```

#### 2. `components/data-table.vue`

```vue
<script setup lang="ts">
import type { DataTableProps } from '@/components/data-table'
import { DataTable, useGenerateVueTable } from '@/components/data-table'

import type { IConversation } from '@/services/api/conversation.api'

import DataTableToolbar from './data-table-toolbar.vue'

const props = defineProps<DataTableProps<IConversation>>()
const table = useGenerateVueTable<IConversation>(props)
</script>

<template>
  <DataTable :columns :data :loading :table :server-pagination="serverPagination">
    <template #toolbar>
      <slot name="toolbar" :table="table">
        <DataTableToolbar :table class="w-full overflow-x-auto" />
      </slot>
    </template>
  </DataTable>
</template>
```

#### 3. `index.vue`

```vue
<script setup lang="ts">
import { BasicPage } from '@/components/global-layout'
import { useGetConversationListQuery } from '@/services/api/conversation.api'

import { columns } from './components/columns'
import DataTable from './components/data-table.vue'

const query = ref<IConversationListQuery>({
  pageNum: 1,
  pageSize: 10,
})

const { data, isLoading } = useGetConversationListQuery(query)

const list = computed(() => data.value?.data?.list ?? [])
const total = computed(() => data.value?.data?.total ?? 0)

const serverPagination = computed(() => ({
  page: query.value.pageNum,
  pageSize: query.value.pageSize,
  total: total.value,
  onPageChange: (page: number) => {
    query.value.pageNum = page
  },
  onPageSizeChange: (pageSize: number) => {
    query.value.pageSize = pageSize
    query.value.pageNum = 1
  },
}))
</script>

<template>
  <BasicPage title="会话列表" description="..." sticky>
    <div class="overflow-x-auto">
      <DataTable
        :loading="isLoading"
        :data="list"
        :columns="columns"
        :server-pagination="serverPagination"
      />
    </div>
  </BasicPage>
</template>
```

---

## 五、注意事项

1. **`<DataTable>` 必须传入 `table`**
   - 页面里不要直接用全局 `<DataTable>`，要在 `components/data-table.vue` 里用 `useGenerateVueTable` 生成 `table` 再传进去。

2. **服务端分页时 `manualPagination = true`**
   - 此时表格内部不再做客户端分页，`table.getRowModel().rows` 只显示当前页后端返回的数据。

3. **分页组件已做移动端适配**
   - `table-pagination.vue` 在移动端隐藏 First/Last 按钮和 "Rows per page" 文字，只显示翻页图标 + 当前页/总页数。

4. **列的 `accessorKey` 要与后端字段一致**
   - 如果后端字段名不一致，可用 `accessorFn: row => row.xxx` 或 `id` 自定义。

5. **列视图（显示/隐藏列）的中文标题**
   - `view-options.vue` 默认读取 `column.columnDef.meta.title`
   - 所以在 `columns.ts` 里定义列时，除了给 `DataTableColumnHeader` 传 `title`，还要加 `meta: { title: '...' }`
   - 没写 `meta.title` 的列会回退显示 `column.id`（英文）

6. **行操作建议放在 `columns.ts` 里**
   - 通过 `h(DataTableRowActions, { row })` 渲染，保持 `columns.ts`  pure，操作逻辑抽到 `data-table-row-actions.vue`。

---

## 六、迁移检查清单

- [ ] 创建 `conversations/components/data-table.vue`
- [ ] 创建 `conversations/components/columns.ts`
- [ ] 创建 `conversations/components/data-table-toolbar.vue`（可选，先保持现有筛选）
- [ ] 修改 `conversations/index.vue` 使用新的 `DataTable`
- [ ] 删除原页面里的手写 `<Table>`、`<Skeleton>` 加载、手写分页
- [ ] 验证 `serverPagination.onPageChange` / `onPageSizeChange` 正确更新 `query`
- [ ] 移动端验证分页显示正常
- [ ] `pnpm lint && pnpm build` 通过
