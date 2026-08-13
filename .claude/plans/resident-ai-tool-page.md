# 居民AI工具页面开发计划（方案 A：列表页 + 分配子页）

对接文档：`doc/居民AI工具对接接口.md`
API 层：`src/services/api/resident-ai-tool.api.ts`（已完成，0 类型错误，当前零消费方）

## 一、接口给页面定下的硬约束

| 约束 | 来源 | 页面影响 |
|---|---|---|
| 分配粒度是**分类**，全文无 `residentId` | §1 | 入口是侧边栏独立页 `/community/ai-tool`（菜单项已存在，`roles: [3]`） |
| `POST /assign` 整分类**全量覆盖**，`skillIds: []` 即清空 | §4.3 | 必须脏态 diff + 保存前确认 + 离开拦截，不能勾一下发一次请求 |
| `/list`、`/assign-list` **均不分页**；`assign-list` 必须带 `cateCode` | §4.1/§4.2 | 分配区一次性渲染全量卡片；未选分类不发请求（API 层已 `enabled` 门控） |
| `assign` 只收 `cateCode + skillIds`，无 `torder`/`isEnable`/`poster` | §4.3 | 无行内排序编辑（比 steward 简单） |
| `CateAddDTO` 无 `type`/`tempType`（后端固定 type=10） | §3.3 | 表单比 `community/cate` 少两个字段 |

## 二、文件清单（12 个）

```
src/pages/community/ai-tool/
├── index.vue                          ← 改写现有 20 行占位
├── [cateCode].vue                     ← 新增（分配子页）
├── components/
│   ├── columns.ts
│   ├── data-table.vue
│   ├── data-table-toolbar.vue
│   ├── data-table-row-actions.vue
│   ├── cate-create.vue
│   ├── cate-form-sheet.vue
│   ├── cate-form.vue
│   ├── cate-delete-dialog.vue
│   └── skill-assign-card.vue
└── validators/
    └── ai-tool-cate.validator.ts
```

**不做**：详情弹窗（分类只有 name/describe/torder/isEnable/createTime 五个字段，列表已全部可见，YAGNI）。

## 三、复用的既有范式（逐文件对应）

| 新文件 | 照抄来源 |
|---|---|
| `index.vue` | `community/cate/index.vue`（93 行；去掉 typeFilter） |
| `columns.ts` / `data-table.vue` / `data-table-toolbar.vue` | `community/cate/components/` 同名文件 |
| `cate-create.vue` / `cate-form-sheet.vue` / `cate-form.vue` | `community/cate/components/` 同名文件（表单删 type/tempType） |
| `cate-delete-dialog.vue` | `community/cate/components/cate-delete-dialog.vue`（AlertDialog + uniqueCode） |
| `data-table-row-actions.vue` | `steward/components/category/data-table-row-actions.vue`（手写 items + `router.push`） |
| `[cateCode].vue` 骨架/脏态/守卫 | `steward/[categoryId].vue`（`Modal*` 双弹窗 + `onBeforeRouteLeave`） |
| `skill-assign-card.vue` 视觉 | `merchants/[merchantId].vue:262-337`（勾选卡片 + inputType 徽章 + tags） |

## 四、`index.vue`（分类管理）

- `query = ref<IResidentAiToolCateListQuery>({ pageNum: 1, pageSize: 10 })` → `useGetResidentAiToolCatePageQuery(query)`
- `list`/`total` computed，`serverPagination` computed（`onPageSizeChange` 重置 `pageNum = 1`）
- `search` + `useDebounceFn(300)` 写入 `query.keyword`
- `BasicPage title="居民AI工具" description="管理AI工具分类，并按分类为全小区居民配置可用的AI工具" sticky`
- `#actions` → `<CateCreate />`
- `<route lang="yaml">meta: roles: [3]`

`columns.ts` 列：名称、描述、状态（`residentAiToolEnableStatusConfig`）、排序、创建时间、actions。

`data-table-row-actions.vue` 手写 items：
```ts
const items = computed(() => [
  { key: 'assign', label: '配置工具', icon: SparklesIcon },
  { key: 'edit', label: '编辑', icon: PencilIcon },
  { key: 'delete', label: '删除', icon: Trash2Icon, variant: 'destructive' as const },
])
// assign → router.push(`/community/ai-tool/${cate.uniqueCode}`)
```

`validators/ai-tool-cate.validator.ts`：
```ts
export const residentAiToolCateValidator = z.object({
  uniqueCode: optionalString,
  name: z.string().min(1, '名称不能为空'),
  parentCode: optionalString,
  describe: optionalString,
  torder: optionalInt,
  isEnable: optionalNumber,
})
```

## 五、`[cateCode].vue`（工具分配）— 核心逻辑

### 状态模型：两个 `Set<string>` 做 diff

```ts
const cateCode = computed(() => (route.params as Record<string, string>).cateCode)

// 只依赖 cateCode，不含搜索词（见下方「关键坑」）
const assignQuery = computed(() => ({ cateCode: cateCode.value }))
const { data, isLoading } = useGetResidentAiToolAssignListQuery(assignQuery)
const skillList = computed(() => data.value?.data ?? [])

const original = ref<Set<string>>(new Set())   // 后端真相
const current = ref<Set<string>>(new Set())    // 本地编辑态

watch(skillList, (list) => {
  const checked = new Set(list.filter(s => s.checked).map(s => s.skillId))
  original.value = checked
  current.value = new Set(checked)             // 复制，不共享引用
}, { immediate: true })

const added = computed(() => [...current.value].filter(id => !original.value.has(id)))
const removed = computed(() => [...original.value].filter(id => !current.value.has(id)))
const isDirty = computed(() => added.value.length > 0 || removed.value.length > 0)
const isClearing = computed(() => current.value.size === 0 && original.value.size > 0)
```

`toggleSkill` 用 `new Set(current.value)` 复制后增删再整体赋值（不可变，参照 `merchants/[merchantId].vue:77`）。

### 关键坑：搜索必须前端过滤

`assign-list` 支持 `name` 参数，但若把搜索词放进 `assignQuery`，请求重发会触发 `watch(skillList)` 把 `current` 重置成后端 `checked`，**丢掉未保存的勾选**。列表不分页、全量在手，因此：

```ts
const keyword = ref('')
const filteredList = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return skillList.value
  return skillList.value.filter(s => s.name?.toLowerCase().includes(k))
})
```
搜索只过滤渲染，不影响 `current` —— 这是与 steward 唯一的实质差异点。

### 页头分类名

无 `/cate/{uniqueCode}` 详情接口，改用 `useGetResidentAiToolCateListQuery()`（`/cate/list`，不分页）前端按 `uniqueCode` 找名字：
```ts
const { data: cateData } = useGetResidentAiToolCateListQuery()
const cateName = computed(() =>
  cateData.value?.data?.find(c => c.uniqueCode === cateCode.value)?.name ?? '')
```
`BasicPage :title="cateName ? \`${cateName} · 工具配置\` : 'AI工具配置'"`。

### 交互三件套（沿用 steward 已验证实现）

1. **脏态横幅**：琥珀色条 `本次将新增 N 个、移除 M 个工具，尚未保存`（`+N` / `-M`）
2. **保存前确认 `Modal`**：
   - `confirmTitle`：`isClearing ? '确认清空工具配置?' : '确认保存工具配置?'`
   - `confirmDesc`：`isClearing ? '将清空该分类下全部工具，居民端将看不到任何AI工具，此操作不可撤销。' : \`将${parts.join('、')}，确认提交?\``
   - `isClearing` 时保存按钮切 `variant="destructive"`
3. **`onBeforeRouteLeave` 拦截**：`isDirty` 时弹「放弃未保存的修改?」，`skipLeaveGuard` 在确认离开时置位

保存：
```ts
assign({ cateCode: cateCode.value, skillIds: [...current.value] }, {
  onSuccess: () => { toast.success('保存成功'); isConfirmOpen.value = false },
  onError: err => toast.error(err.message || '保存失败'),
})
```
mutation 内部已 invalidate `residentAiToolList` + `residentAiToolAssignList`，列表自动刷新并重置 `original`。

### `skill-assign-card.vue`

props `{ skill: IResidentAiToolAssignSkill, selected: boolean }`，emit `toggle`。
- 选中态 `ring-2 ring-primary border-primary bg-primary/5`
- `Checkbox` + `pointer-events-none`，整卡 `@click` 切换
- 图标：`skill.icon` 优先，`@error` 回退到 `inputType` 对应 lucide 图标（`iconFallback: Set<string>`）
- 徽章：`skillInputTypeConfig[skill.inputType]`（**注意 `inputType` 在本接口是 optional，需 `?.` + 兜底**）
- `toolMode` 本地小 map：`{ 1: '单次对话', 2: '流程式向导' }`（`skill.api.ts` 无此 config）
- 右侧 `skill.checked` 显示「已配置/未配置」（后端原始态，与本地勾选区分开，便于用户看出改了什么）

状态展示复用 `skillAssignStatusConfig`（`1=已分配/2=暂停/3=过期`）。文档写 `1=生效`，语义相同，不重复定义 config。

加载中 `Skeleton × 4`；空列表虚线边框空态「该分类暂无可配置的AI工具」。

## 六、实施顺序（3 批，逐批可验证）

**批次 1 — 分类管理**
`validators/ai-tool-cate.validator.ts` → `cate-form.vue` → `cate-form-sheet.vue` → `cate-create.vue` → `cate-delete-dialog.vue` → `columns.ts` → `data-table-row-actions.vue` → `data-table-toolbar.vue` → `data-table.vue` → `index.vue`

**批次 2 — 分配子页**
`skill-assign-card.vue` → `[cateCode].vue`

**批次 3 — 验证**
- `npx vue-tsc -b`（真实类型检查；`--noEmit` 因根 tsconfig `files: []` 是空检查）
- `npx eslint --fix` 覆盖新增文件
- 不跑 `vite build`、不 push（用户已明确「先别管」）

## 七、待你确认的两项（不阻塞实施）

1. `src/pages/community/resident/RESIDENT-AI-TOOL-CONFLICT.md` 已被新文档推翻（新文档采用「全小区共享」，且其「不写 ai_skill_user_assign」的结论与新文档相反）。**默认不动**，你点头我再删除或加废弃标注。
2. shell 注意事项：本仓库带方括号的路由文件名在 `git add` / `sed` 时必须单引号包裹（`'[cateCode].vue'`），否则 zsh glob 报 `no matches found` 并导致整条命令失败。
