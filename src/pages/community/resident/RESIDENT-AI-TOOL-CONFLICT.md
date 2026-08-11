# 居民模块 - 待确认冲突

> 状态:**阻塞开发** · 创建于 2026-08-11
> 起因:会话中断恢复后发现「居民分配 AI 工具」页面新建未保存,与后端口径冲突,需对齐后才能开发。

---

## 背景

原计划从居民列表行操作新增「分配AI工具」入口,点击跳转到**复制自商户分配页** `src/pages/merchants/[merchantId].vue` 的居民分配页,用于给单个居民分配 AI 工具。

经查证,接口文档 `doc/小区服务/站长工作台PC对接接口.md` 第 6 节「居民AI工具 `/resident/ai-tool`」与"给单个居民开通"的语义对不上,**不闭环**。

---

## 冲突点:第 6 节接口无法承载个体粒度分配

### 1. assign 请求体无居民标识

`POST /resident/ai-tool/assign` 实际入参(见 `src/services/api/resident-ai-tool.api.ts` `IResidentAiToolAssignDTO`):

```ts
{
  cateCode: string      // 分类 uniqueCode
  skillId: number       // 候选工具 skillId
  name?: string         // 展示名称
  poster?: string       // 海报
  describe?: string     // 描述
  torder?: number       // 排序
  isEnable?: 1 | 2      // 启停
}
```

**没有任何 `residentId` / `userId` 字段。** 整个 `resident-ai-tool.api.ts` grep 不到一处 `residentId`。后端无法据此知道开通给"哪个居民"。

### 2. 五个接口全无居民维度参数

| 闭环所需(个体粒度) | 实际接口 | 实际入参 | 居民标识 |
| --- | --- | --- | --- |
| 列出该居民已开通 | `GET /resident/ai-tool/page` | `cateCode, keyword` | ❌ |
| 候选工具 | `GET /resident/ai-tool/candidates` | `name` | ❌ |
| 开通给该居民 | `POST /resident/ai-tool/assign` | `cateCode, skillId, ...` | ❌ |
| 更新 | `PUT /resident/ai-tool` | `uniqueCode, ...` | ❌ |
| 取消该居民开通 | `DELETE /resident/ai-tool/{uniqueCode}` | `uniqueCode` | ❌ |

### 3. 文档约定反向打脸(第 394-398 行)

> - 分类固定 `cate.type = 10`(AI助手)
> - 已开通固定 `service.type = 17`,`otherCode = SkillTool.thirdId`
> - 候选工具:**当前站长已分配** + `ai_skill_tool.type = 2`(Agent)
> - **不写 `ai_skill_user_assign`(开通只写社区服务)**

- `ai_skill_user_assign` 即"居民-工具分配关系表",文档明说不写 -> 不存在居民粒度分配关系。
- 候选池按**站长 stationId** 维度,不按居民。
- 已开通写的是社区服务表(`type=17`),全小区共享。

### 4. 居民 VO 无"已分配工具"字段

第 5 节 `ResidentVO`(第 371-386 行)只有 `aiToolCount`(AI 工具**使用次数**,统计字段),没有"已分配工具列表"。居民管理整节标注「只读列表/详情」。

---

## 无法照搬商户分配页的原因

商户分配页 `src/pages/merchants/[merchantId].vue` 依赖三个接口,**全部绑定 `merchantId`**:

| 用途 | 接口 | 关键参数 |
| --- | --- | --- |
| 商户详情 | `useGetMerchantDetailQuery` | `merchantId` |
| skill 列表(含已分配) | `GET /skill/merchant-list` | `merchantId` |
| 保存分配 | `POST /skill/assign-merchant` | `{ merchantId, skillIds[] }` |

居民(`IResident`)**没有 `merchantId`**,只有 `residentId / userId / stationId`;`skill.api.ts` 里也无任何按居民分配的接口。直接复制,接口层跑不通。

---

## 待后端确认:三选一

1. **口径是"全小区共享"**,只是口语说成"给居民开通"(实际不分居民)
   → 该做成**全局管理页**(分类 + 候选 + 已开通 CRUD,用第 6 节接口,不带 residentId),不该挂在居民列表行操作上。

2. **后端要改接口加 `residentId`**,但文档/代码未更新
   → 让后端给出新签名,前端照着封装 `resident-ai-tool.api.ts`。

3. **靠 token/header 隐式传居民标识**
   → 从居民列表点进不同行无法表达"是哪个居民",技术上不通,排除。

---

## 已就绪(可复用)

- `src/services/api/resident-ai-tool.api.ts`:第 6 节全套 API 已封装(分类 CRUD + 已开通/候选/分配),签名与文档一致,可直接用于方案 1。
- `src/pages/merchants/[merchantId].vue`:商户分配页(348 行),仅作 UI 参考模板,不能直接复用其接口逻辑。
- `src/pages/community/resident/`:居民列表页已完整(只读,index + 5 子组件),行操作当前仅「查看详情」,待加分配入口。

## 待办(解除阻塞后)

- [ ] 后端确认上述三选一
- [ ] 若方案 1:新建全局居民 AI 工具管理页(非行操作跳转),去掉居民行内「分配」入口
- [ ] 若方案 2:补 API 封装 + 新建居民分配页(可参考商户分配页 UI)
- [ ] 「居民AI工具」侧边栏菜单项是否保留(用户已倾向去掉,居民操作在列表完成)
