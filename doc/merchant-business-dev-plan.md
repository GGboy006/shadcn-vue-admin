# 商户后台开发计划

> 对应接口文档:`doc/merchant-api.md`(`BusinessMerchantController`,基础路径 `/merchant`)
> 日期:2026-07-20

## 一、背景与方案总览

本次开发「商户运营后台」,共 6 个模块 19 个接口。核心设计:**一套商户后台页面,两种进入身份,行为一致**。

### 两种进入身份

| 维度 | 商户自己登录 | 站长代客进入 |
|---|---|---|
| userType | 4 / 5(商户/物业) | 3(不变) |
| token | 商户/物业自己的 | **站长自己的**(不隔离,不重新登录) |
| merchantId 来源 | `userInfoStore.merchantInfo.merchantId` | 商户列表跳转时存入 store `enterProxy(mId, mName)` |
| 进入方式 | 正常登录流程 | 商户列表行操作 -> **同窗口跳转** `/merchant-business?mId=xxx`,菜单自动重载 |
| 侧边菜单 | 商户后台 6 项 **+ 设置** | 商户后台 **5 项**(无「商户资料」、无设置) |
| 顶栏「当前商户」 | 不显示 | 显示商户名(store)+ 返回商户列表按钮 |
| 业务页面行为 | 一致(分类/商品/FAQ/活动/订单) | 一致 |
| 调用 `myMerchantInfo` | 是(无参,自身资料) | **否**(站长不调) |

### 不做的事

- ❌ 多标签页 / 新窗口隔离(改为同窗口 + 菜单重载)
- ❌ 双 token 容器、authStore persist 改造
- ❌ 站长重新登录、站长调 `myMerchantInfo`

### 做的事

- ✅ 「代客模式」标识(基于 `proxyMode` store + localStorage persist)

- ✅ 商户后台独立路由前缀 `/merchant-business`
- ✅ 19 个接口封装 + 6 个模块页面
- ✅ 顶栏代客横幅 + 站长入口

---

## 二、核心机制:代客模式与 merchantId

### 2.1 新增 `merchantBusiness` store

**文件**:`src/stores/merchant-business.ts`(新增)

```ts
export const useMerchantBusinessStore = defineStore('merchant-business', () => {
  /** 是否站长代客模式 */
  const proxyMode = ref(false)
  /** 当前操作的 merchantId(两种身份统一) */
  const merchantId = ref('')
  /** 当前操作商户名(代客模式顶栏展示,跳转时从商户列表带入) */
  const merchantName = ref('')

  /** 站长代客进入:从商户列表跳转时显式调用 */
  function enterProxy(mId: string, mName: string) {
    proxyMode.value = true
    merchantId.value = mId
    merchantName.value = mName
  }

  /** 退出代客:点返回按钮时调用 */
  function clear() {
    proxyMode.value = false
    merchantId.value = ''
    merchantName.value = ''
  }

  /** 商户/物业自身:从用户信息取 merchantId(非代客) */
  function initSelf(userInfoStore) {
    proxyMode.value = false
    merchantName.value = '' // 自身模式顶栏不显示商户名
    merchantId.value = userInfoStore.merchantInfo?.merchantId ?? ''
  }

  return { proxyMode, merchantId, merchantName, enterProxy, clear, initSelf }
}, {
  persist: {
    // 复用 plugins/pinia/setup.ts 全局 storage(localStorage),不直接引用 localStorage(与 auth.ts 一致,SSR/测试友好)
    pick: ['proxyMode', 'merchantId', 'merchantName'],
  },
})
```

**要点(Q3 新方案:同窗口 + 菜单重载):**
- persist 用 **localStorage**:同窗口刷新页面需保持代客状态;退出时显式 `clear()`
- `use-sidebar.ts` 的 `navData` 同时依赖 `proxyMode`,进入/退出代客模式菜单**自动重算**,无需手动重载路由
- token 仍走原 `authStore`(localStorage),站长不重新登录 ✅
- **不再使用新窗口**:站长点「进入商户后台」-> 当前窗口跳转 `/merchant-business?mId=xxx` -> 菜单切换为商户后台 5 项(无商户资料、无设置)-> 顶栏显示返回按钮

> Q1 新确认:站长**不调用 `myMerchantInfo`**,也不重新登录。商户名由商户列表跳转时带入 store(`enterProxy(mId, mName)`),顶栏直接读 `merchantName`。

### 2.2 `useCurrentMerchantId()` composable

**文件**:`src/composables/use-current-merchant-id.ts`(新增)

```ts
export function useCurrentMerchantId() {
  const store = useMerchantBusinessStore()
  const merchantId = computed(() => store.merchantId)
  const proxyMode = computed(() => store.proxyMode)
  const merchantName = computed(() => store.merchantName)
  return { merchantId, proxyMode, merchantName }
}
```

所有商户后台接口的路径拼接和 queryKey 都依赖 `merchantId.value`。

### 2.3 初始化时机

在 `router/guard/common-guard.ts` 或新建 `merchant-business-guard.ts`:
- 进入 `/merchant-business` 前缀路由时:
  - **userType=3(站长)**:若 URL 带 `mId` 且 store 未进入代客 -> 调 `enterProxy(mId, mName?)`(mName 若 URL 未带则留空);若已 `proxyMode` 直接放行;若无 mId 且非代客 -> 跳回 `/merchants`
  - **userType=4/5(商户/物业)**:调 `initSelf()` 从用户信息取 merchantId;若自身 merchantId 为空 -> 跳 `/errors/403`
- 退出代客:返回按钮调 `clear()` + `router.push('/merchants')`,菜单自动回站长视角

---

## 三、路由规划

采用 `unplugin-vue-router` 文件路由,在 `src/pages/merchant-business/` 下建文件:

| 路由 | 文件 | 模块 | 接口数 |
|---|---|---|---|
| `/merchant-business` → 重定向到 `/merchant-business/profile` | `index.vue` | - | - |
| `/merchant-business/profile` | `profile.vue` | 商户信息 | 2 |
| `/merchant-business/category` | `category/index.vue` | 商户分类 | 5 |
| `/merchant-business/goods` | `goods/index.vue` | 商品 | 5 |
| `/merchant-business/faq` | `faq/index.vue` | FAQ | 4 |
| `/merchant-business/activity` | `activity/index.vue` | 优惠活动 | 5 |
| `/merchant-business/order` | `order/index.vue` | 订单 | 3 |

### 路由 meta

```yaml
# 每个页面 <route> 块
meta:
  roles: [3, 4, 5]   # 商户(4)、物业(5)、站长(3)均可
```

权限补充校验(在 guard 或页面内):userType=3 必须处于代客模式(有 merchantId),否则跳商户列表。userType=4/5 自身直接可进。

---

## 四、菜单与权限

### 4.1 修改 `src/composables/use-sidebar.ts`

在 `rawNavData` 中新增「商户后台」菜单组,根据身份显示:

```ts
const merchantBusinessNavItems = computed(() => {
  // 「商户资料」仅商户/物业自身可见,站长代客不显示(站长不调 myMerchantInfo)
  const items = [
    { title: '商户资料', url: '/merchant-business/profile', icon: StoreIcon, selfOnly: true },
    { title: '商品分类', url: '/merchant-business/category', icon: FolderTreeIcon },
    { title: '商品管理', url: '/merchant-business/goods', icon: PackageIcon },
    { title: 'FAQ', url: '/merchant-business/faq', icon: HelpCircleIcon },
    { title: '优惠活动', url: '/merchant-business/activity', icon: TagIcon },
    { title: '订单管理', url: '/merchant-business/order', icon: ShoppingCartIcon },
  ]
  // 代客模式过滤掉 selfOnly 项;代客不显示「设置」,商户自身由原 settings 组提供设置
  return items
})
```

显示条件:`[4, 5].includes(userType) || (userType === 3 && proxyMode)`(商户/物业自身,或 站长代客)。

- 商户/物业自身(userType=4 或 5):显示「商户后台」组 + 原「设置」组
- 站长代客(userType=3 且 proxyMode):**只显示「商户后台」组**(隐藏设置、隐藏站长视角的「商户/物业管理」「聊天工作台」等)
- 站长原窗口(userType=3,非代客):保持原有菜单不变(不显示商户后台)

> Q2 已确认:物业(userType=5)与商户(userType=4)模式完全一致,都进商户后台。
> Q3 新确认:同窗口方案,`navData` computed 依赖 `proxyMode`,进入/退出代客菜单自动重载,无需手动重载路由。

### 4.2 顶栏代客横幅

**文件**:`src/components/merchant-business/proxy-banner.vue`(新增)

- 仅 `userType === 3 && proxyMode === true` 时渲染(商户自身不需要返回按钮)
- 显示「当前操作商户:{merchantName}」+「返回商户列表」按钮
- 商户名直接读 `useMerchantBusinessStore().merchantName`(跳转时由商户列表带入,**不调 myMerchantInfo**,Q1 已确认)
- 挂载到 `src/layouts/default.vue` 顶栏区域

**返回按钮实现(Q3 新确认:同窗口模式,返回 = 退出代客 + 跳回列表):**

```ts
function handleBack() {
  // 退出代客:清状态 + 跳回商户列表,菜单自动重载为站长视角
  const store = useMerchantBusinessStore()
  store.clear()
  router.push('/merchants')
}
```

> Q3 新确认:同窗口方案,返回 = `clear()` 退出代客 + 跳回 `/merchants`,菜单自动回站长视角。

---

## 五、API 封装(B1)

### 5.1 新增 `src/services/api/merchant-business.api.ts`

沿用现有 `merchant.api.ts` 的模式:`useQuery/useMutation + apiFetch`,统一 queryKey 前缀 `merchantBusiness`。

按模块分区封装 19 个接口:

```ts
// ===== 类型定义 =====
export interface IMerchantBusinessVO { /* 文档 1.1 字段 */ }
export interface IMerchantBusinessUpdateDTO { /* 文档 1.2 字段 */ }
export interface ICateVO { /* 文档 2.1/2.2 */ }
export interface ICateAddReq { name: string; torder?: number }
export interface ICateUpdateReq { cateCode: string; name: string; torder?: number }
export interface IGoodsVO { /* 文档 3.1 */ }
export interface IGoodsResp { /* 文档 3.2 */ }
export interface IGoodsAddReq { /* 文档 3.3 */ }
export interface IGoodsUpdateReq extends IGoodsAddReq { goodsCode: string }
export interface IFaqResp { /* 文档 4.1 */ }
export interface IFaqAddReq { categoryName?: string; question: string; answer: string; torder?: number; isEnable?: number }
export interface IFaqUpdateReq extends IFaqAddReq { faqCode: string }
export interface IActivityResp { /* 文档 5.1 */ }
export interface IActivityAddReq { /* 文档 5.3 */ }
export interface IActivityUpdateReq extends IActivityAddReq { uniqueCode: string }
export interface IOrderListVO { /* 文档 6.1 */ }
export interface IOrderDetailVO { /* 文档 6.2 */ }

// ===== 商户信息 =====
useGetMyMerchantInfoQuery(merchantId)        // GET /merchant/myMerchantInfo/{merchantId}
useUpdateMyMerchantInfoMutation()            // PUT /merchant/updateMyMerchantInfo

// ===== 分类 =====
useGetCateAllQuery(merchantId)               // GET /merchant/cate/{merchantId}/all
useGetCatePageQuery(merchantId, query)       // GET /merchant/cate/{merchantId}/page
useCreateCateMutation(merchantId)            // POST /merchant/cate/{merchantId}
useUpdateCateMutation(merchantId)            // PUT /merchant/cate/{merchantId}
useDeleteCateMutation(merchantId)            // DELETE /merchant/cate/{merchantId}/{cateCode}

// ===== 商品 =====
useGetGoodsPageQuery(merchantId, query)      // GET /merchant/goods/{merchantId}/page
useGetGoodsDetailQuery(merchantId, goodsCode)// GET /merchant/goods/{merchantId}/detail
useCreateGoodsMutation(merchantId)           // POST /merchant/goods/{merchantId}
useUpdateGoodsMutation(merchantId)           // PUT /merchant/goods/{merchantId}
useDeleteGoodsMutation(merchantId)           // DELETE /merchant/goods/{merchantId}/{goodsCode}

// ===== FAQ =====
useGetFaqPageQuery(merchantId, query)        // GET /merchant/faq/{merchantId}/page
useCreateFaqMutation(merchantId)             // POST /merchant/faq/{merchantId}
useUpdateFaqMutation(merchantId)             // PUT /merchant/faq/{merchantId}
useDeleteFaqMutation(merchantId)             // DELETE /merchant/faq/{merchantId}/{faqCode}

// ===== 活动 =====
useGetActivityPageQuery(merchantId, query)   // GET /merchant/activity/{merchantId}/page
useGetActivityDetailQuery(merchantId, activityCode) // GET /merchant/activity/{merchantId}/detail
useCreateActivityMutation(merchantId)        // POST /merchant/activity/{merchantId}
useUpdateActivityMutation(merchantId)        // PUT /merchant/activity/{merchantId}
useDeleteActivityMutation(merchantId)        // DELETE /merchant/activity/{merchantId}/{activityCode}

// ===== 订单 =====
useGetOrderPageQuery(merchantId, query)      // GET /merchant/order/{merchantId}/page
useGetOrderDetailQuery(merchantId, orderid)  // GET /merchant/order/{merchantId}/detail
exportOrder(merchantId, query)               // GET /merchant/order/{merchantId}/export (blob)
```

### 5.2 queryKey 规范

`['merchantBusiness', '<module>', merchantId, ...rest]`,merchantId 纳入 key,切换商户自动重新请求。

### 5.3 `myMerchantInfo` 调用策略(Q1 最新确认)

后端:`/merchant/myMerchantInfo` 路径不变,merchantId 参数可选。
**站长不调用此接口,也不重新登录**(Q1 最新确认)。

**处理:**
- `use-auth.ts:50` / `use-user-info.ts:21` **保持现状无参调用**(商户/物业登录后获取自身信息,零改动)
- 商户后台「商户资料」页(`profile.vue`):**仅商户/物业自身可访问**,调无参 `/merchant/myMerchantInfo`
  - 站长代客模式下 `profile` 菜单项**隐藏**(站长不需要看/改商户资料,资料由商户自己维护)
  - 即 `profile` 的菜单显示条件:`[4,5].includes(userType) && !proxyMode`

> 这样彻底避免了站长调 `myMerchantInfo`,站长代客只操作分类/商品/FAQ/活动/订单 5 个模块。

---

## 六、订单导出工具(B5)

**文件**:`src/utils/download.ts`(新增,通用)

```ts
import { ofetch } from 'ofetch'
import { ApiStatus } from '@/constants/api-status'
import { API_BASE_URL } from '@/constants/app-config'
import pinia from '@/plugins/pinia/setup'
import { useAuthStore } from '@/stores/auth'

/** 带 token 的文件下载(blob) */
export async function downloadFile(url: string, filename: string, query?: Record<string, any>) {
  const authStore = useAuthStore(pinia)
  const blob = await ofetch(`${API_BASE_URL}${url}`, {
    method: 'GET',
    query,
    responseType: 'blob',
    headers: authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {},
  })
  const blobUrl = URL.createObjectURL(blob as Blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  a.click()
  URL.revokeObjectURL(blobUrl)
}
```

订单页调用:`downloadFile(\`/merchant/order/${merchantId}/export\`, \`订单导出_${formatTimestamp()}.xlsx\`, { statusType, keyword })`。

文件名时间戳格式 `yyyyMMddHHmm`,如 `订单导出_202607201430.xlsx`(Q6 已确认带时间戳)。

```ts
// 时间戳生成(避免用 new Date() 在某些环境的坑,用 dayjs 项目已装)
import dayjs from 'dayjs'
function formatTimestamp() {
  return dayjs().format('YYYYMMDDHHmm')
}
```

---

## 七、业务模块页面(6 个)

所有模块沿用现有 `merchants/` 模板:
- `DataTable + useGenerateVueTable` 服务端分页
- `columns.ts` 列定义 + `data-table-row-actions.vue` 行操作下拉
- `Modal/ModalContent` 弹窗 + `vee-validate + zod` 表单
- `useUpload` 图片上传

### 7.1 商户资料 `/merchant-business/profile`(2 接口)

> **仅商户/物业自身可访问**(userType=4/5 且非代客)。站长代客模式下菜单不显示此项,直接访问 URL 也由 guard 拦截跳回。Q1 已确认:站长不调 `myMerchantInfo`。

- 展示 `BusinessMerchantVO` 全字段(复用现有 `IMerchant` 类型,字段基本一致)
- 接口:无参 `GET /merchant/myMerchantInfo`(自身)+ `PUT /merchant/updateMyMerchantInfo`
- 编辑表单:复用 `merchant-form.vue` 结构,但走 `updateMyMerchantInfo` 接口
- 字段最多:基本信息、联系、签约、营业设置、轮播图(多图)、其他图
- **轮播图/其他图多图上传**:项目无现成组件(Q5 已确认),基于 `useUpload` 自做 `multi-image-upload.vue` -- 逐张上传拿 URL,维护一个 URL 数组,支持预览/删除/拖拽排序

### 7.2 商品分类 `/merchant-business/category`(5 接口)

- 列表:名称、排序、启用状态、商品数(`goodsCount`)
- 增删改弹窗:仅 `name` + `torder`,最简单
- 删除:路径参数 `cateCode`

### 7.3 商品管理 `/merchant-business/goods`(5 接口)

- 列表筛选:分类下拉(`useGetCateAllQuery` 提供)、关键词
- 列:封面图、名称、分类、价格、推荐、启用
- 表单:封面图 + 详情图上传、内容(`content` 用 textarea,Q4 已确认)、分类选择、价格、推荐/启用/免费标志
- 详情抽屉:`detail` 接口

### 7.4 FAQ `/merchant-business/faq`(4 接口,无详情)

- 列表:标签(`categoryName`)、问题、答案、排序、状态
- 表单:标签、问题、答案(textarea)、排序、启用
- 最简单的 CRUD

### 7.5 优惠活动 `/merchant-business/activity`(5 接口)

- 列表:封面、名称、分类、时间范围、收费/免费、**审核状态**(待审核/通过/未通过 Badge)、推荐、启用
- 表单:名称、封面/详情图、主办单位、分类、地址、收费/免费、价格、起止时间( DatePicker 范围)、推荐/启用
- 审核字段(`auditTime`/`auditRemark`)只读展示
- 详情抽屉

### 7.6 订单管理 `/merchant-business/order`(3 接口,只读)

- 顶部 Tab:全部 / 已完成(2) / 待付款(3) / 已退款(4)
- 列:订单号、客户、商品描述、金额、支付方式、状态、下单时间
- 详情抽屉
- 导出按钮:`downloadFile` 下载 xlsx

---

## 八、站长入口

### 修改 `src/pages/merchants/components/data-table-row-actions.vue`

下拉菜单新增「进入商户后台」项:

```vue
<UiDropdownMenuItem @click.stop="handleEnterBusiness">
  <StoreIcon class="size-4 mr-2" />
  进入商户后台
</UiDropdownMenuItem>
```

```ts
function handleEnterBusiness() {
  // 同窗口跳转:先存入代客 store(带商户名),再跳转,菜单自动重载为商户后台
  const store = useMerchantBusinessStore()
  store.enterProxy(merchant.value.merchantId, merchant.value.merchantName)
  router.push({ path: '/merchant-business', query: { mId: merchant.value.merchantId } })
}
```

> Q3 新方案:不再 `window.open` 新窗口,改为同窗口跳转 + `enterProxy` 写入 store,菜单随 `proxyMode` 自动重载。URL 仍带 `mId` 供刷新恢复。

---

## 九、开发顺序与里程碑

> ✅ 阶段 0-3 已全部完成(2026-07-20)。阶段 4 第 14 项站长入口已在阶段 1 完成,第 15 项双身份自测待手动验证。

### 阶段 0:基础设施(阻塞后续,先做) ✅

1. ✅ 新增 `stores/merchant-business.ts`(代客模式 store)
2. ✅ 新增 `composables/use-current-merchant-id.ts`
3. ✅ 路由 guard:进入 `/merchant-business*` 初始化 store + 权限校验
4. ✅ 新增 `utils/download.ts`(导出工具)
5. ✅ 新增 `services/api/merchant-business.api.ts`(19 接口封装 + 类型)

### 阶段 1:跑通最简 CRUD(分类) ✅

6. ✅ `merchant-business/category/` 页面(列表 + 增删改弹窗)
7. ✅ 菜单接入 `use-sidebar.ts`
8. ✅ 顶栏代客横幅 `proxy-banner.vue`

-> ✅ **里程碑达成:代客模式链路打通,站长能从商户列表进入,看到分类页 CRUD**

### 阶段 2:其余 CRUD 模块 ✅

9. ✅ `faq/`(同样简单)
10. ✅ `goods/`(含分类联动、图片、详情)
11. ✅ `activity/`(含审核状态、时间范围)
12. ✅ `profile/`(商户资料,字段最多,多图上传)

### 阶段 3:只读 + 导出 ✅

13. ✅ `order/`(列表 + 详情 + 导出)

### 阶段 4:收尾

14. ✅ 站长入口(行操作下拉,阶段 1 已完成)
15. ⏳ 双身份自测:商户/物业自身登录 + 站长代客 全流程(待手动验证)

> 注:`use-auth.ts`/`use-user-info.ts` 登录流程**不改动**(Q1 写法 A),仅 profile 页按身份决定带参。

### 实现记录(TDD 统计)

- 全量测试:**101 通过**(原有 30 + 新增 71)
- 新增测试覆盖:store 状态流转(7)、composable 响应式(3)、download 纯函数(9)、api builder(4)、guard 路由逻辑(9)、菜单过滤(4)、各模块 payload builder(分类 5/FAQ 5/商品 4/活动 7/资料 7)、订单状态映射(7)
- build:成功;typecheck:干净;lint:干净

---

## 十、文件清单

### 新增文件

```
src/stores/merchant-business.ts
src/composables/use-current-merchant-id.ts
src/utils/download.ts
src/services/api/merchant-business.api.ts
src/components/merchant-business/proxy-banner.vue
src/router/guard/merchant-business-guard.ts          # 或并入 common-guard
src/pages/merchant-business/index.vue                 # 重定向到 profile
src/pages/merchant-business/profile.vue
src/pages/merchant-business/category/index.vue
src/pages/merchant-business/category/components/*.vue # columns/data-table/form/delete
src/pages/merchant-business/goods/index.vue
src/pages/merchant-business/goods/components/*.vue
src/pages/merchant-business/faq/index.vue
src/pages/merchant-business/faq/components/*.vue
src/pages/merchant-business/activity/index.vue
src/pages/merchant-business/activity/components/*.vue
src/pages/merchant-business/order/index.vue
src/pages/merchant-business/order/components/*.vue
```

### 修改文件

```
src/composables/use-sidebar.ts              # 新增商户后台菜单组 + 代客模式判断
src/layouts/default.vue                      # 挂载 proxy-banner
src/pages/merchants/components/data-table-row-actions.vue  # 加「进入商户后台」
src/router/guard/index.ts                    # 注册 merchant-business-guard(若独立)
```

> 注:`use-auth.ts` / `use-user-info.ts` **不改动**(Q1 已确认:站长不调 `myMerchantInfo`、不重新登录;商户/物业自身登录走无参 `/merchant/myMerchantInfo` 保持现状)。商户后台「商户资料」页仅商户/物业自身使用,也走无参 `myMerchantInfo`。

---

## 十一、待确认点

| # | 问题 | 默认处理 |
|---|---|---|
| Q1 | `myMerchantInfo` 现有代码无参调用,文档要求 `/{merchantId}`。后端是否已改? | 默认按文档带 merchantId,同步改 `use-auth.ts`/`use-user-info.ts` |
回答（初版）：/merchant/myMerchantInfo 路径不变,merchantId 参数可选,商户自身无参、站长带参,两者不冲突。
回答（最新更新）：站长**不调用** `myMerchantInfo`,也**不重新登录**。商户/物业自身登录仍走无参调用(保持现状)。站长代客的商户名由商户列表跳转时 `enterProxy(mId, mName)` 带入 store,顶栏直接读。商户资料页仅商户自身可访问,站长代客菜单隐藏该项。
| Q2 | userType=5(物业)是否也进商户后台?现状登录 4/5 都走商户分支 | 暂按 userType=4 处理,物业待确认 |
答：是的，模式都是一样的
| Q3 | 站长代客模式是否需要「返回商户列表」按钮,还是直接关新窗口? | 默认提供返回按钮 + 可关窗 |
答（初版）：既然新窗口打开了，就需要返回了
答（最新更新）：不使用新窗口,改为**同窗口跳转 + 重载菜单**实现进入商户平台效果。站长点「进入商户后台」-> 当前窗口跳 `/merchant-business?mId=xxx` + `enterProxy()` -> 菜单自动切换为商户后台 5 项 -> 顶栏显示「当前商户 + 返回」按钮。返回时 `clear()` + 跳回 `/merchants`,菜单自动回站长视角。
| Q4 | 商品/活动的 `content` 富文本,用现有 textarea 还是引入富文本编辑器? | 默认 textarea,富文本待确认 |
答：先使用简单的textarea
| Q5 | 商户资料页的轮播图(`bannerImages`)/其他图(`otherImages`)多图上传,有无现成组件? | 默认基于 useUpload 自做多图上传 |
答：暂时无上传组件，先使用项目的默认上传
| Q6 | 订单导出文件名固定 `订单导出.xlsx`,是否要带时间戳? | 默认按文档固定名 |
答：带时间戳
---

## 十二、风险与注意

1. **标识字段命名不统一**(易错):分类 `cateCode`、商品 `goodsCode`、FAQ `faqCode`、活动更新用 `uniqueCode` 但删除路径用 `activityCode`。封装时严格按文档,加注释。
2. **自动注入字段**:`merchantCode`、`orgCode` 后端注入,前端 DTO 不传。
3. **活动审核状态**:新增时 `status` 是否允许前端传 0(待审核)?建议新增表单不显示 status,由后端默认。
4. **代客模式状态一致性**:同窗口方案下 `proxyMode` 存 localStorage,站长退出代客必须调 `clear()`(返回按钮已处理)。需防范:站长在代客模式直接改 URL 访问 `/merchants` 等站长页面时,若 `proxyMode` 未清,菜单仍为商户后台 -- 建议 guard 里对非 `/merchant-business` 路由检测到 `proxyMode` 时自动 `clear()`。
5. **类型复用**:现有 `src/stores/user-info.ts` 的 `BusinessMerchantVO` 与文档 1.1 字段基本一致,可复用或扩展。
6. **商户名来源依赖跳转传参**:站长代客的商户名靠 `enterProxy(mId, mName)` 带入。若站长直接复制 `/merchant-business?mId=xxx` 链接打开(没走商户列表跳转),`merchantName` 会为空,顶栏只显示「返回」不显示商户名 -- 可接受,或 guard 里 mName 为空时从 `/station/merchant/page` 补查。
