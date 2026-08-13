# 管家模块 Long ID 类型修复:number -> string

## 根因

`housekeeperId` / `staffId` / `categoryId` 都是雪花长整型(> 2^53)。代码库已有范式:`merchantId` 在 `merchant.api.ts` 全程为 `string`,validator 为 `optionalString`(见 `committee.validator.ts`、`merchant.validator.ts`)。

管家模块错把这些 Long ID 标成 `number`,且 `staff.validator.ts` 用 `.transform(Number)` 主动转数字 —— 超过 `Number.MAX_SAFE_INTEGER` 丢精度,创建人员时传错 `housekeeperId`。分配页 `[categoryId].vue:35` 的 `Number(route.params.categoryId)` 是同类陷阱(路由参数本就是字符串)。

后端对 Long ID 返回字符串(与 merchantId 一致),前端必须全程保持字符串,任何 `Number()` 转换都会破坏精度。

## 修复范围(3 层,约 16 文件)

### 第 1 层:API 类型 `src/services/api/housekeeper.api.ts`

把三个 Long ID 全改为 `string`(参照 `merchantId`):

| 接口/类型 | 字段 | number -> string |
|---|---|---|
| `IHousekeeperService` | `housekeeperId` | ✅ |
| `IHousekeeperServiceSaveDTO` | `housekeeperId?` | ✅ |
| `useGetHousekeeperServiceDetailQuery` | 入参 `Ref<number \| undefined>` | ✅ |
| `useUpdateHousekeeperServiceStatusMutation` | `{ housekeeperId }` | ✅ |
| `useDeleteHousekeeperServiceMutation` | 入参 `number` | ✅ |
| `IHousekeeperStaff` | `staffId`, `housekeeperId` | ✅ |
| `IHousekeeperStaffListQuery` | `housekeeperId?` | ✅ |
| `IHousekeeperStaffSaveDTO` | `staffId?`, `housekeeperId` | ✅ |
| `useGetHousekeeperStaffListQuery` | 入参 `Ref<number \| undefined>` | ✅ |
| `useGetHousekeeperStaffDetailQuery` | 入参 `Ref<number \| undefined>` | ✅ |
| `useUpdateHousekeeperStaffStatusMutation` | `{ staffId }` | ✅ |
| `useDeleteHousekeeperStaffMutation` | 入参 `number` | ✅ |
| `IHousekeeperCategory` | `categoryId` | ✅ |
| `IHousekeeperCategorySaveDTO` | `categoryId?` | ✅ |
| `useGetHousekeeperCategoryDetailQuery` | 入参 `Ref<number \| undefined>` | ✅ |
| `useUpdateHousekeeperCategoryStatusMutation` | `{ categoryId }` | ✅ |
| `useDeleteHousekeeperCategoryMutation` | 入参 `number` | ✅ |
| `IHousekeeperCategoryProvider` | `housekeeperId`, `staffId?` | ✅ |
| `IHousekeeperCategoryProvidersSaveDTO` | `categoryId` | ✅ |
| `IHousekeeperCategoryProviderVO` | `id`, `categoryId`, `housekeeperId`, `staffId?` | ✅ |
| `useGetHousekeeperCategoryProvidersQuery` | 入参 `Ref<number \| undefined>` | ✅ |

> `stationId`/`userId` 非本轮报告范围,保持 `number`(非用户可选/表单提交的主键)。
> `merchantId?` 在 service 类型里也改 `string`(与 merchant.api.ts 一致)。
> `sortOrder`/`status` 是真实小整数,保持 `number`。

### 第 2 层:Validators(3 文件)

- `staff.validator.ts`:`housekeeperId` 去掉 `.transform(Number)`,改必填字符串(zod `string` + refine 非空);`staffId: optionalNumber` -> `optionalString`
- `service.validator.ts`:`housekeeperId: optionalNumber` -> `optionalString`;`merchantId: optionalNumber` -> `optionalString`
- `category.validator.ts`:`categoryId: optionalNumber` -> `optionalString`

### 第 3 层:消费方页面/组件

类型改为 string 后,大部分消费方"自动正确"(ID 只是透传/插值/比较)。需手动改的点:

**active 破坏点(必须改,否则运行时丢精度):**
- `[categoryId].vue:35` `Number(route.params.categoryId)` -> 去掉 `Number()`,直接取字符串
- `[categoryId].vue:56` `staffId: p.staffId ?? 0` -> `p.staffId ?? ''`
- `[categoryId].vue` `ProviderItem` 接口:`housekeeperId/staffId: number` -> `string`
- `[categoryId].vue` 函数签名 `handleRemoveByStaff(staffId: number)` 等 -> `string`;`currentStaffIds` Set<string>
- `provider-picker.vue` `ProviderItem`、`currentStaffIds: Set<number>`、`selectedHousekeeperId: ref<number>`、`isChecked/handleToggle` 签名 -> string

**透传点(类型自动流转,确认无 `Number()` 即可):**
- `staff-form.vue`:serviceOptions value、initialValues、buildPayload(去 transform 后 housekeeperId 即字符串)
- `staff/data-table-toolbar.vue`:`housekeeperIdFilter`/`housekeeperIdModel` 类型随 query 类型变 string
- `staff/data-table-row-actions.vue`、`staff-delete.vue`、`staff-edit.vue`:ID 透传到 mutation/路径查询,字符串即可
- `service-form.vue`、`service/data-table-row-actions.vue`、`service-delete.vue`、`service-edit.vue`:同上
- `category-form.vue`、`category/data-table-row-actions.vue`、`category-delete.vue`、`category-edit.vue`:同上
- `index.vue`:`staffHousekeeperIdFilter` ref 类型随 query 变 string
- `columns.ts` / `data-table.vue`:无显式 number 标注(grep 已确认),类型透传,无需改

> reka-ui Select 保留 value 原始类型;`SelectItem :value="s.housekeeperId"` 现在 value 是字符串,选中即字符串,无需 `String()` 包裹。

## 不改动的项
- `sortOrder`(小整数)、`status`(1/2)、`gender` 等非 Long ID 字段保持 number
- `stationId`/`userId` 保持 number(非本轮范围,非表单主键)
- `useDeleteHousekeeperCategoryProviderMutation` 占位实现(未使用,不动)

## 验证
1. `npx vue-tsc --noEmit --pretty false`(过滤 TS5101)退出码 0
2. `npm run lint`(eslint,确认无 no-alert 等遗留)
3. 手动核对:staff-form 创建时 payload.housekeeperId 为字符串;分配页保存 payload 的 categoryId/housekeeperId/staffId 均为字符串

## 提交
单次提交:`fix(community-steward): Long ID 改为字符串避免精度丢失`
