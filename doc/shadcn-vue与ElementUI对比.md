# shadcn-vue 与 Element UI 用法对比

## 概述

| | Element UI | shadcn-vue |
|--|-----------|------------|
| **表单校验** | `:rules` 对象数组 | Zod Schema + VeeValidate |
| **表单绑定** | `v-model` + `:prop` | `FormField` + `v-bind="componentField"` |
| **表格** | `el-table` + `el-table-column` | `@tanstack/vue-table` + `ColumnDef` |
| **表格数据** | `:data` 直接传数组 | `useVueTable` 管理状态 |
| **组件风格** | 一体化（属性多、功能全） | 原子化（组件拆分细、自由组合） |

---

## 表单对比

### 完整示例：用户信息表单

**Element UI：**

```vue
<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="80px"
  >
    <el-form-item label="昵称" prop="nickname">
      <el-input v-model="form.nickname" placeholder="请输入昵称" />
    </el-form-item>

    <el-form-item label="手机号" prop="phone">
      <el-input v-model="form.phone" disabled />
    </el-form-item>

    <el-form-item label="性别" prop="gender">
      <el-select v-model="form.gender" placeholder="选择性别">
        <el-option label="未知" :value="0" />
        <el-option label="男" :value="1" />
        <el-option label="女" :value="2" />
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="onSubmit">提交</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive, ref } from 'vue'

const formRef = ref()
const form = reactive({
  nickname: '',
  phone: '',
  gender: 0,
})

const rules = {
  nickname: [
    { required: true, message: '昵称不能为空', trigger: 'blur' },
    { min: 2, max: 20, message: '长度 2-20 字符', trigger: 'blur' },
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' },
  ],
}

function onSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      console.log(form)
    }
  })
}
</script>
```

**shadcn-vue：**

```vue
<template>
  <form @submit="onSubmit">
    <FormField v-slot="{ componentField }" name="nickname">
      <FormItem>
        <FormLabel>昵称</FormLabel>
        <FormControl>
          <Input v-bind="componentField" placeholder="请输入昵称" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="phone">
      <FormItem>
        <FormLabel>手机号</FormLabel>
        <FormControl>
          <Input v-bind="componentField" disabled />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="gender">
      <FormItem>
        <FormLabel>性别</FormLabel>
        <Select v-bind="componentField">
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="选择性别" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem :value="0">未知</SelectItem>
            <SelectItem :value="1">男</SelectItem>
            <SelectItem :value="2">女</SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    </FormField>

    <Button type="submit">提交</Button>
  </form>
</template>

<script setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'

const schema = toTypedSchema(z.object({
  nickname: z.string().min(2, '昵称至少2个字符').max(20, '昵称不能超过20个字符'),
  phone: z.string().optional(),
  gender: z.number().default(0),
}))

const { handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: {
    nickname: '',
    phone: '',
    gender: 0,
  },
})

const onSubmit = handleSubmit((values) => {
  console.log(values)
})
</script>
```

---

### 核心差异

| 功能 | Element UI | shadcn-vue |
|------|-----------|------------|
| **表单容器** | `<el-form>` 组件 | 原生 `<form>` + `useForm()` |
| **字段绑定** | `v-model="form.xxx"` + `prop="xxx"` | `<FormField name="xxx">` + `v-bind="componentField"` |
| **校验规则** | `:rules="{ xxx: [...] }"` | Zod Schema：`z.object({ xxx: z.string() })` |
| **校验触发** | `trigger: 'blur'` / `trigger: 'change'` | 自动（input/blur/submit 都会触发） |
| **错误显示** | `el-form-item` 内置 | 手动加 `<FormMessage />` |
| **提交校验** | `formRef.validate((valid) => { ... })` | `handleSubmit((values) => { ... })` |
| **类型安全** | 无 | Zod 推导 TypeScript 类型 |

---

### 组件对照表

| Element UI | shadcn-vue | 说明 |
|-----------|------------|------|
| `el-form` | `useForm()` + `<form>` | 表单容器 |
| `el-form-item` | `<FormItem>` | 字段容器（但拆得更细） |
| `el-input` | `<Input>` | 输入框 |
| `el-select` | `<Select>` + `<SelectContent>` + `<SelectItem>` | 下拉选择（拆成多个组件） |
| `el-button` | `<Button>` | 按钮 |
| `el-radio` | `<RadioGroup>` + `<RadioGroupItem>` | 单选 |
| `el-checkbox` | `<Checkbox>` | 复选框 |
| `el-switch` | 暂无，可用 Checkbox 替代 | 开关 |

---

## 表格对比

### 完整示例：任务列表

**Element UI：**

```vue
<template>
  <el-table
    :data="tasks"
    @selection-change="handleSelectionChange"
  >
    <el-table-column type="selection" width="55" />
    <el-table-column prop="id" label="ID" width="80" />
    <el-table-column prop="title" label="标题" />
    <el-table-column prop="status" label="状态">
      <template #default="{ row }">
        <el-tag :type="row.status === 'done' ? 'success' : 'warning'">
          {{ row.status }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="120">
      <template #default="{ row }">
        <el-button type="text" @click="handleEdit(row)">编辑</el-button>
        <el-button type="text" @click="handleDelete(row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
const tasks = ref([
  { id: 1, title: '任务1', status: 'pending' },
  { id: 2, title: '任务2', status: 'done' },
])

const selectedRows = ref([])

function handleSelectionChange(rows) {
  selectedRows.value = rows
}
</script>
```

**shadcn-vue（项目中 tasks 的实现）：**

```vue
<!-- pages/tasks/index.vue -->
<template>
  <DataTable :data="tasks" :columns="columns" />
</template>

<script setup>
import { columns } from './components/columns'
import DataTable from './components/data-table.vue'
import tasks from './data/tasks.json'
</script>
```

```ts
// pages/tasks/components/columns.ts
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { Badge } from '@/components/ui/badge'
import DataTableRowActions from './data-table-row-actions.vue'

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => h('div', row.getValue('id')),
  },
  {
    accessorKey: 'title',
    header: '标题',
    cell: ({ row }) => {
      return h('span', { class: 'font-medium' }, row.getValue('title'))
    },
  },
  {
    accessorKey: 'status',
    header: '状态',
    cell: ({ row }) => {
      const status = row.getValue('status')
      return h(Badge, { variant: status === 'done' ? 'default' : 'secondary' }, () => status)
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => h(DataTableRowActions, { row }),
  },
]
```

```vue
<!-- pages/tasks/components/data-table.vue -->
<template>
  <DataTable :columns :table :data>
    <template #toolbar>
      <DataTableToolbar :table />
    </template>
  </DataTable>
</template>

<script setup>
import { useGenerateVueTable } from '@/components/data-table'

const props = defineProps()
const table = useGenerateVueTable(props)
</script>
```

---

### 核心差异

| 功能 | Element UI | shadcn-vue |
|------|-----------|------------|
| **表格组件** | `<el-table>` | `@tanstack/vue-table` + 自定义 `DataTable` |
| **列定义** | `<el-table-column>` 标签 | `ColumnDef[]` 数组（TS 类型安全） |
| **数据** | `:data` 直接传 | `useVueTable({ data, columns, ... })` |
| **自定义单元格** | `<template #default="{ row }">` | `cell: ({ row }) => h(...)` |
| **多选** | `type="selection"` | `SelectColumn`（自定义列定义） |
| **排序** | `sortable` 属性 | `enableSorting: true` |
| **筛选** | `filters` 属性 | `filterFn` 函数 |
| **分页** | `el-pagination` + `:total` | `DataTablePagination` 组件 |
| **工具栏** | 无内置 | `DataTableToolbar`（搜索、列显隐） |

---

### 组件对照表

| Element UI | shadcn-vue | 说明 |
|-----------|------------|------|
| `el-table` | `DataTable` | 表格容器（自定义封装） |
| `el-table-column` | `ColumnDef` | 列定义（代码而非模板） |
| `el-pagination` | `DataTablePagination` | 分页器 |
| `el-tag` | `<Badge>` | 标签 |
| `el-button` | `<Button>` | 按钮 |

---

## 设计理念差异

### Element UI

```
一体化设计：一个组件搞定所有功能

<el-table :data="list" stripe border height="500">
  <el-table-column sortable filterable type="selection" />
</el-table>

特点：
- 属性多，配置简单
- 内置分页、多选、排序、筛选
- 样式固定，难深度定制
```

### shadcn-vue

```
原子化设计：组件拆分，自由组合

<!-- 列定义单独文件 -->
const columns = [
  { accessorKey: 'name', header: '姓名', cell: ({ row }) => ... },
]

<!-- 表格容器 -->
<DataTable :columns :data>
  <template #toolbar><DataTableToolbar /></template>
</DataTable>

特点：
- 组件拆分细，按需组合
- 样式基于 Tailwind，完全可控
- 需要自己封装 DataTable（项目中已封装）
```

---

## 迁移建议

| Element UI 用法 | shadcn-vue 等价写法 |
|----------------|-------------------|
| `v-model="form.name"` | `v-bind="componentField"`（在 `FormField` 内） |
| `:rules="rules"` | `validationSchema: toTypedSchema(z.object(...))` |
| `formRef.validate()` | `handleSubmit((values) => { ... })` |
| `el-form-item` | `<FormItem>` + `<FormLabel>` + `<FormControl>` + `<FormMessage>` |
| `el-table` | `useVueTable()` + `DataTable` |
| `el-table-column` | `ColumnDef[]` |
| `slot-scope="{ row }"` | `cell: ({ row }) => ...` |
| `el-pagination` | `DataTablePagination` |

---

## 总结

| 场景 | 推荐选择 |
|------|---------|
| 快速搭建、功能标准 | Element UI |
| 需要深度定制样式 | shadcn-vue |
| 类型安全要求高 | shadcn-vue（Zod + TS） |
| 团队协作、规范统一 | shadcn-vue（组件源码在项目中） |
| 减少依赖、长期维护 | shadcn-vue（源码可控） |
